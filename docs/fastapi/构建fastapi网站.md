# 构建fastapi网站

## 1.入口设计

```python
from fastapi import FastAPI
	
app = FastAPI()
```

定义好app之后 即可运行，

```bash
uvicorn main:app --reload
```

:::tip `uvicorn main:app` 命令含义如下:

- `main`：`main.py` 文件（一个 Python「模块」）。
- `app`：在 `main.py` 文件中通过 `app = FastAPI()` 创建的对象。
- `--reload`：让服务器在更新代码后重新启动。仅在开发时使用该选项。

:::

**也有更方便的办法，直接import uvicorn之后，在代码中执行uvicorn.run()**

```python
import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```





## 2.url传参（路径参数、查询参数）和 请求体传参

### 路径参数

```python
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}
```

路径参数 `item_id` 的值将作为参数 `item_id` 传递给你的函数。

如果你有一个接收路径参数的路径操作，但你希望预先设定可能的有效参数值，则可以使用标准的 Python `Enum` 类型。

#### 预设值 

创建一个 `Enum` 类

导入 `Enum` 并创建一个继承自 `str` 和 `Enum` 的子类。

通过从 `str` 继承，API 文档将能够知道这些值必须为 `string` 类型并且能够正确地展示出来。

然后创建具有固定值的类属性，这些固定值将是可用的有效值：

```Python
from enum import Enum
from fastapi import FastAPI

class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"

app = FastAPI()

@app.get("/models/{model_name}")
async def get_model(model_name: ModelName):
    if model_name is ModelName.alexnet:
        return {"model_name": model_name, "message": "Deep Learning FTW!"}
    if model_name.value == "lenet":
        return {"model_name": model_name, "message": "LeCNN all the images"}
    return {"model_name": model_name, "message": "Have some residuals"}
```



### 查询参数

```python
@app.get("/items/")
async def read_item(skip: int = 0, limit: int = 10):
```

**由于查询参数不是路径的固定部分，因此它们可以是可选的，并且可以有默认值。也可以将它们的默认值设置为 `None` (或其它值)来声明可选查询参数**

**如果要把查询参数设置为必选，就不要声明默认值。**如果路径中没有必选参数 ，返回的响应中会显示错误信息。

```python
@app.get("/items/{item_id}")
async def read_item(item_id: str, q: str | None = None):
    if q:
        return {"item_id": item_id, "q": q}
    return {"item_id": item_id}

```



1.查询参数才有可能用到默认值，路径参数必须要有路径，所以不会用到默认值的

2.URL传参（路径参数、查询参数）都是一个简单的值类型，如果需要复杂类型就要通过请求体传参



### 请求体

当你需要将数据从客户端（例如浏览器）发送给 API 时，你将其作为「请求体」发送。

要发送数据，你必须使用下列方法之一：`POST`（较常见）、`PUT`、`DELETE` 或 `PATCH`。

```python
class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None
```

需要把数据模型声明为继承 `BaseModel` 的类。

与声明查询参数一样，包含默认值的模型属性是可选的，否则就是必选的。默认值为 `None` 的模型属性也是可选的。



FastAPI允许定义一个或多个请求体，这就涉及到请求体如何被处理的问题。

对于只定义了一个请求体的情况，FastAPI默认可以处理JSON格式的请求体，并将其中的key:value对应到指定的Pydantic模型中。

而当定义了多个请求体时，FastAPI会将它们再次包装在一层结构内。这样，它就可以使用参数名称作为请求体中的键（字段名称），来接收JSON数据。

总体来说，FastAPI提供了灵活且方便的请求体处理方式，使开发者能够更好地控制和管理请求数据。

举例，当定义了多个请求体时，fastapi期望得到的json格式如下：

```json
{
    "item": {
        "name": "Foo",
        "description": "The pretender",
        "price": 42.0,
        "tax": 3.2
    },
    "user": {
        "username": "dave",
        "full_name": "Dave Grohl"
    }
}
```

当只有一个body参数时，默认情况下，FastAPI 将直接期望获取它的主体。

但可以在body()中加入embed=True，来使fastapi像解析多个请求体一样，嵌套一层

#### 在pydantic model中，使用`Field`定义字段的属性

```python
class Item(BaseModel):
    name: str
    description: str | None = Field(default=None, title="The description of the item", max_length=300)
    price: float = Field(gt=0, description="The price must be greater than zero")
    tax: float | None = None
```

Field 的工作方式与 Query、Path 和 Body 相同，它具有所有相同的参数等。

333333..........3333333333333

### 注意事项

在def函数的参数时，将依次按如下规则进行识别：

- 如果在**路径**中也声明了该参数，它将被用作路径参数。
- 如果参数属于**单一类型**（比如 `int`、`float`、`str`、`bool` 等）它将被解释为**查询**参数(除非强制把它定义为body)。
- 如果参数的类型被声明为一个 **Pydantic 模型**，它将被解释为**请求体**。





### 使用Query,Param,Body 为参数添加额外校验和信息

Query,Param,Body中可以添加max_length等校验参数

也可以添加

- `alias`（key的别名）
- `title`用于在openapi显示
- `description`用于openapi
- `deprecated`bool 用于openapi 显示已经弃用

```python
from typing import Annotated	// FastAPI 在 0.95.0 版本中添加了对 Annotated 的支持（并开始推荐它），用Annotated更清晰易阅读
from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/items/")
async def read_items(q: Annotated[str | None, Query(max_length=50)] = None):	// 在Query中写校验，在等号后面写默认值
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
    if q:
        results.update({"q": q})
    return results
```



## 3.定义响应模型

```python
@app.post("/items/")
async def create_item(item: Item) -> Item:
    return item


@app.get("/items/")
async def read_items() -> list[Item]:
    return [
        Item(name="Portal Gun", price=42.0),
        Item(name="Plumbus", price=32.0),
```

fastapi 0.89版本之后，已经将response_model与->函数返回值类型 基本绑定在一起了。

现在所有的响应都会通过函数返回类型来执行response_model，可以不用再单独写response_model，并且默认就会要过一遍response_model，所以如果有多种返回，会不符合pydantic的格式要求，可以通过[resopnse_model=None](https://fastapi.tiangolo.com/tutorial/response-model/#disable-response-model) 来关闭pydantic验证。（不太建议，一个响应有多种格式的返回本身就不好）



### 使用`response_model_exclude_unset`来排除未设置的值

```python
class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float = 10.5
    tags: list[str] = []
```

当一个Schema定义了默认值时，如果实际的结果中并没有赋值，那么fastapi就会响应默认值。使用response_model_exclude_unset=True，可以在响应体中排除这些未被赋值的默认值。（在noSQL或者一些类JSON的格式中会比较常用，在sql数据库中一般会要求not null，所以不太可能出现未赋值的情况）此外还有

- `response_model_exclude_defaults=True`
- `response_model_exclude_none=True`

### 使用`response_model_include` (只要) 和`response_model_exclud`（排除） 来筛选key值





## 4.表单处理

### OAuth2 登录

OAuth2 规范的**密码流**规定要通过表单字段发送 `username` 和 `password`。

该规范明确要求字段必须命名为 `username` 和 `password`，并通过表单字段发送，不能用 JSON。

即post请求头必须携带：

`headers: { "Content-Type": "application/x-www-form-urlencoded" }`普通的字符串表单

或者

`headers: { "Content-Type": "multipart/form-data" }`二进制流表单

```python
@app.post("/login/")
async def login(username: str = Form(), password: str = Form()):
    return {"username": username}
```

要显式使用 `Form` 声明表单体，否则，FastAPI 会把表单参数当作查询参数或请求体（JSON）参数。



## 5.文件处理

### File类

使用File来接受处理整个文件的上传。这些文件将作为**表单数据**上传。

```python
from fastapi import File

@app.post("/files/")
async def create_file(file: Annotated[bytes, File()]):	// 这里File()类和body,param等有相同的地位
    return {"file_size": len(file)}

```

### UploadFile类

```python
from fastapi import UploadFile

@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile):	//这里的UploadFile其实类似于Schema，  后面还需要=Body()。因为是以json传输
    return {"filename": file.filename}
```

1. 两者的写法有不同，见上面的注释。
2. `File`是同步的，而`UploadFile`是异步的。
3. `File`封装了上传文件的属性，而`UploadFile`则提供了流式访问上传文件的接口。
4. `File`适用于较小的上传文件，而`UploadFile`适用于大文件。

需要注意的是，在使用`UploadFile`时，要注意文件对象在使用完毕后需要关闭，否则会出现文件泄漏的问题。例如：
