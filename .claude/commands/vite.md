Inicia o Vite dev server. Executar em background sem bloquear o terminal:

```bash
PIDS=$(netstat -ano 2>/dev/null | grep ":5173" | awk '{print $NF}' | sort -u)
if [ -n "$PIDS" ]; then
  echo "$PIDS" | while read pid; do taskkill //F //PID "$pid" 2>/dev/null; done
  sleep 1
fi
cd frontend && npm run dev
```
