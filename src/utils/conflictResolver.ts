/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SyncRecord {
  id: string;
  updated_at?: string; // ISO 8601 Timestamp
  version?: number;     // Numeric version tracker
  [key: string]: any;
}

export type ResolutionStrategy =
  | 'MASTER_DOMINANT'
  | 'CLIENT_DOMINANT'
  | 'TIMESTAMP_COMPARISON'
  | 'VERSION_COMPARISON'
  | 'FIELD_MERGE';

export interface CollisionConfig {
  defaultStrategy: ResolutionStrategy;
  clientPriorityFields?: string[]; // Fields where client always wins
  masterPriorityFields?: string[]; // Fields where master always wins
  enableFieldLevelMerging?: boolean;
}

export interface CollisionResolutionResult<T extends SyncRecord> {
  resolvedRecord: T;
  hasConflict: boolean;
  strategyUsed: string;
  details: string;
  diff: {
    field: string;
    localValue: any;
    masterValue: any;
    selectedValue: any;
  }[];
}

/**
 * Utility to resolve conflicts between local offline-cached edits and the master PostgreSQL database.
 */
export class ConflictResolver {
  /**
   * Resolves a conflict between a single offline-cached local record and a master DB record.
   * Compares 'updated_at' timestamps, numeric 'version' markers, and optional field-level configurations.
   */
  static resolve<T extends SyncRecord>(
    local: T,
    master: T,
    config: CollisionConfig = { defaultStrategy: 'TIMESTAMP_COMPARISON', enableFieldLevelMerging: true }
  ): CollisionResolutionResult<T> {
    const diff: CollisionResolutionResult<T>['diff'] = [];
    let hasConflict = false;

    // 1. Check if they are actually different
    const allKeys = Array.from(new Set([...Object.keys(local), ...Object.keys(master)]));
    for (const key of allKeys) {
      if (key === 'updated_at' || key === 'version') continue;
      const localVal = local[key];
      const masterVal = master[key];

      // Shallow equality comparison
      if (JSON.stringify(localVal) !== JSON.stringify(masterVal)) {
        // Only treat as conflict if BOTH local and master have values and they are different
        if (localVal !== undefined && masterVal !== undefined) {
          hasConflict = true;
        }
        diff.push({
          field: key,
          localValue: localVal,
          masterValue: masterVal,
          selectedValue: undefined, // Will be populated later
        });
      }
    }

    // If there is no real data difference, we can just return either (with updated_at/version updated)
    if (!hasConflict && diff.length === 0) {
      return {
        resolvedRecord: { ...master, ...local }, // merge meta
        hasConflict: false,
        strategyUsed: 'NO_CONFLICT',
        details: 'Local and master records are already identical.',
        diff: [],
      };
    }

    const localTime = local.updated_at ? new Date(local.updated_at).getTime() : 0;
    const masterTime = master.updated_at ? new Date(master.updated_at).getTime() : 0;

    const localVer = typeof local.version === 'number' ? local.version : 0;
    const masterVer = typeof master.version === 'number' ? master.version : 0;

    let strategyUsed: string = config.defaultStrategy;
    let details = '';
    let resolved: T = { ...master };

    // Apply strategies
    if (config.defaultStrategy === 'CLIENT_DOMINANT') {
      resolved = { ...master, ...local };
      strategyUsed = 'CLIENT_DOMINANT';
      details = 'Resolved using Client Dominant fallback strategy.';
    } else if (config.defaultStrategy === 'MASTER_DOMINANT') {
      resolved = { ...local, ...master };
      strategyUsed = 'MASTER_DOMINANT';
      details = 'Resolved using Master Dominant fallback strategy.';
    } else if (config.defaultStrategy === 'VERSION_COMPARISON' && localVer !== masterVer) {
      if (localVer > masterVer) {
        resolved = { ...master, ...local };
        strategyUsed = 'VERSION_COMPARISON';
        details = `Resolved using version comparison (Local v${localVer} > Master v${masterVer}).`;
      } else {
        resolved = { ...local, ...master };
        strategyUsed = 'VERSION_COMPARISON';
        details = `Resolved using version comparison (Master v${masterVer} >= Local v${localVer}).`;
      }
    } else {
      // Default / fallback: TIMESTAMP_COMPARISON
      if (localTime > masterTime) {
        resolved = { ...master, ...local };
        strategyUsed = 'TIMESTAMP_COMPARISON';
        details = `Resolved using timestamps. Local is newer (${new Date(localTime).toISOString()} > ${new Date(masterTime).toISOString()}).`;
      } else if (masterTime > localTime) {
        resolved = { ...local, ...master };
        strategyUsed = 'TIMESTAMP_COMPARISON';
        details = `Resolved using timestamps. Master is newer (${new Date(masterTime).toISOString()} > ${new Date(localTime).toISOString()}).`;
      } else {
        // Timestamps are equal or missing, check versions next
        if (localVer > masterVer) {
          resolved = { ...master, ...local };
          strategyUsed = 'VERSION_FALLBACK';
          details = `Timestamps identical. Resolved using version fallback (Local v${localVer} > Master v${masterVer}).`;
        } else {
          resolved = { ...local, ...master };
          strategyUsed = 'MASTER_FALLBACK';
          details = 'Timestamps and versions are identical or missing. Defaulted to Master authoritative record.';
        }
      }
    }

    // 2. Apply field-level overrides or field-level merging if enabled
    if (config.enableFieldLevelMerging) {
      const mergedRecord = { ...resolved } as any;
      
      for (const item of diff) {
        const { field, localValue, masterValue } = item;

        // Check priority lists first
        if (config.clientPriorityFields?.includes(field)) {
          mergedRecord[field] = localValue;
          item.selectedValue = localValue;
        } else if (config.masterPriorityFields?.includes(field)) {
          mergedRecord[field] = masterValue;
          item.selectedValue = masterValue;
        } else {
          // Otherwise use resolved base value
          mergedRecord[field] = (resolved as any)[field];
          item.selectedValue = (resolved as any)[field];
        }
      }
      resolved = mergedRecord as T;
    } else {
      // Populating select values in diff
      for (const item of diff) {
        item.selectedValue = (resolved as any)[item.field];
      }
    }

    // Bump the version and set a fresh timestamp on the resolved record to reflect resolution
    const finalResolved = { ...resolved } as any;
    finalResolved.version = Math.max(localVer, masterVer) + 1;
    finalResolved.updated_at = new Date().toISOString();
    resolved = finalResolved as T;

    return {
      resolvedRecord: resolved,
      hasConflict,
      strategyUsed,
      details,
      diff,
    };
  }

  /**
   * Synchronizes an array of cached local updates with the current master database records.
   * Computes individual resolutions and summarizes results.
   */
  static syncBatch<T extends SyncRecord>(
    localBatch: T[],
    masterRecords: T[],
    config?: CollisionConfig
  ): {
    resolvedRecords: T[];
    conflictCount: number;
    resolutions: { id: string; success: boolean; result: CollisionResolutionResult<T> }[];
  } {
    const resolvedRecords: T[] = [];
    const resolutions: { id: string; success: boolean; result: CollisionResolutionResult<T> }[] = [];
    let conflictCount = 0;

    // Create a dictionary of master records for quick O(1) lookup
    const masterMap = new Map<string, T>();
    for (const r of masterRecords) {
      masterMap.set(r.id, r);
    }

    for (const local of localBatch) {
      const master = masterMap.get(local.id);

      if (!master) {
        // If it doesn't exist on master, it's a pure offline insertion, so local wins immediately
        const resolved: T = {
          ...local,
          version: (local.version || 1),
          updated_at: local.updated_at || new Date().toISOString(),
        };
        resolvedRecords.push(resolved);
        resolutions.push({
          id: local.id,
          success: true,
          result: {
            resolvedRecord: resolved,
            hasConflict: false,
            strategyUsed: 'OFFLINE_INSERT',
            details: 'Record is new and does not exist in master PostgreSQL database.',
            diff: [],
          },
        });
      } else {
        // Conflict check & resolution
        const res = this.resolve(local, master, config);
        resolvedRecords.push(res.resolvedRecord);
        if (res.hasConflict) conflictCount++;
        resolutions.push({
          id: local.id,
          success: true,
          result: res,
        });
      }
    }

    return {
      resolvedRecords,
      conflictCount,
      resolutions,
    };
  }
}
