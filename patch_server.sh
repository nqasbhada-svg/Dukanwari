#!/bin/bash
awk '
/app.get..\/api\/settings/ {
  print "  app.get('\''/api/expenses'\'', async (req, res) => {"
  print "    try {"
  print "      const data = await getAllExpenses();"
  print "      res.json(data);"
  print "    } catch (err) {"
  print "      res.status(500).json({ error: String(err) });"
  print "    }"
  print "  });"
  print ""
  print "  app.post('\''/api/expenses'\'', async (req, res) => {"
  print "    try {"
  print "      const data = await createExpense(req.body);"
  print "      res.json(data);"
  print "    } catch (err) {"
  print "      res.status(500).json({ error: String(err) });"
  print "    }"
  print "  });"
  print ""
  print "  app.delete('\''/api/expenses/:id'\'', async (req, res) => {"
  print "    try {"
  print "      const success = await deleteExpenseById(req.params.id);"
  print "      if (success) res.json({ success: true });"
  print "      else res.status(500).json({ error: '\''Failed to delete'\'' });"
  print "    } catch (err) {"
  print "      res.status(500).json({ error: String(err) });"
  print "    }"
  print "  });"
  print ""
}
{ print }
' server.ts > server_new.ts
mv server_new.ts server.ts
