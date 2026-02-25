Fecha o Vite (se estiver rodando) e inicia novamente. Executar em background sem bloquear o terminal:

```bash
lsof -ti:5173 | xargs kill -9 2>/dev/null
cd frontend && npm run dev
```
