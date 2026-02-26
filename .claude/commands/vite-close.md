Fecha o processo do Vite na porta 5173:

```bash
PIDS=$(netstat -ano 2>/dev/null | grep ":5173" | awk '{print $NF}' | sort -u)
if [ -n "$PIDS" ]; then
  echo "$PIDS" | while read pid; do taskkill //F //PID "$pid" 2>/dev/null; done
  sleep 1
fi
netstat -ano 2>/dev/null | grep ":5173" && echo "ainda rodando" || echo "processo encerrado"
```

Confirmar que o processo foi encerrado.
