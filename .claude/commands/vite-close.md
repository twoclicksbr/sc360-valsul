Fecha o processo do Vite na porta 5173:

```bash
lsof -ti:5173 | xargs kill -9 2>/dev/null
```

Confirmar que o processo foi encerrado.
