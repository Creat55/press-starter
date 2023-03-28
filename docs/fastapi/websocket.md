# WebSocket推送消息给前端

# 后端配置

```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str|dict, type="str"):
        """

        :param message: 要发送的内容
        :param type: 内容的类型，可选json/str
        :return:
        """
        if type == "str":
            for connection in self.active_connections:
                await connection.send_text(message)
        elif type == "json":
            for connection in self.active_connections:
                await connection.send_json(message)

manager = ConnectionManager()


@ws_router.websocket("/ws/{id}")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    token = await websocket.receive_text()
    if not token or token != "wst":
        await manager.send_personal_message("ws鉴权失败",websocket)
        manager.disconnect(websocket)
    await manager.broadcast({"title": "连接成功", "message": "ws创建成功"},type="json")
    try:
        while True:
            # 这里连接不能断
            data = await websocket.receive_text()
            await websocket.send_json({"title": "连接成功", "message": f"Still online Message text was: {data}"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        
        
 

```

前端

```vue
// 用websocket接收订单
var ws = new WebSocket(`ws://localhost:8999/ws/1`)
ws.onopen = function () {
  ws.send("wst")
}
ws.onmessage = function (event) {
  const res = JSON.parse(event.data)
  const { title, message } = res
  if (title == "连接成功") {
    console.log("ws:", res)
    return
  }
  ElNotification({ title: title, message: message, type: "success", duration: 60000 })
}

```
