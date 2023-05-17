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



### 子路由定义

```python
from fastapi import APIRouter

router = APIRouter()
```

可以将 `APIRouter` 视为一个「迷你 `FastAPI`」类。

所有相同的选项都得到支持。

所有相同的 `parameters`、`responses`、`dependencies`、`tags` 等等。

### fastapi 主体

```python
from fastapi import Depends, FastAPI

from .dependencies import get_query_token, get_token_header
from .internal import admin
from .routers import items, users

app = FastAPI(dependencies=[Depends(get_query_token)])


# 使用 app.include_router()，我们可以将每个 APIRouter 添加到主 FastAPI 应用程序中。
app.include_router(users.router)
app.include_router(items.router)
app.include_router(
    admin.router,
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_token_header)],
    responses={418: {"description": "I'm a teapot"}},
)

```



## 2.url传参（路径参数、查询参数）和 请求体传参

### 路径参数

```python
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}
```

路径参数 `item_id` 的值将作为参数 `item_id` 传递给你的函数。



#### 预设值 

如果你有一个接收路径参数的路径操作，但你希望预先设定可能的有效参数值，则可以使用标准的 Python `Enum` 类型。

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

**如果要把查询参数设置为必选，就不要声明默认值。**如此若路径中没有必选参数 ，返回的响应中会显示错误信息。

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

### **Request类

当你定义一个 FastAPI 路由处理函数时，可以使用 `Request` 类型的参数，以便在函数内部访问和操作请求对象的各个属性和方法。通过 `Request` 对象，你可以获取请求的头部信息、路径参数、查询参数、请求体数据等。

`Request` 对象和 `Query`，`Param`，`Body` 参数声明器是紧密相关的，因为在路由处理函数中，你可以通过 `Request` 对象访问请求的各个部分，也可以通过 `Query`，`Param`，`Body` 参数声明器来指定参数的类型和验证规则，并从请求中提取和解析参数。

综上所述，`Request` 类提供了对整个 HTTP 请求的访问和操作，`Query`、`Param` 和 `Body` 参数用于从 `Request` 对象中提取数据。

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

:::tip

不包含文件时，表单数据一般用 `application/x-www-form-urlencoded`「媒体类型」编码。

但表单包含文件时，编码为 `multipart/form-data`。使用了 `File`，**FastAPI** 就知道要从请求体的正确位置获取文件。

:::

```python
@app.post("/login/")
async def login(username: Annotated[str, Form()], password: Annotated[str, Form()]):
    return {"username": username}
```

要显式使用 `Form` 声明表单体，否则，FastAPI 会把表单参数当作查询参数或请求体（JSON）参数。



## 5.文件处理

### File类

使用File来接受处理整个文件的上传。这些文件将作为**表单数据**上传。

默认File类使用bytes定义，也可以修改为UploadFile

```python
from fastapi import File,UploadFile

@app.post("/files/")
async def create_file(file: Annotated[bytes, File()]):	// 这里File()类和body,param,form等有相同的地位,事实上File就是继承于Form
    return {"file_size": len(file)}

@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile):	// 当使用了UploadFile时，fastapi可以自动的识别为File()。
												// 这里的UploadFile其实类似于Schema，后面省略了=File()(或者file:Annotated[UploadFile,File()])。
    return {"filename": file.filename}
```

bytes和UploadFile的区别

1. 两者的写法有不同，见上面的注释。
2. `bytes`是同步的，而`UploadFile`是异步的。
3. `bytes`封装了上传文件的属性，而`UploadFile`则提供了流式访问上传文件的接口。
4. `bytes`适用于较小的上传文件，而`UploadFile`适用于大文件。
5. UploadFile使用 spooled 文件：
   存储在内存的文件超出最大上限时，FastAPI 会把文件存入磁盘；
6. 这种方式更适于处理图像、视频、二进制文件等大型文件，好处是不会占用所有内存；
7. 可获取上传文件的元数据；
8. 自带 file-like async 接口；
9. 暴露的 Python SpooledTemporaryFile 对象，可直接传递给其他预期「file-like」对象的库。

**需要注意的是，在使用`UploadFile`时，要注意文件对象在使用完毕后需要关闭，否则会出现文件泄漏的问题。例如：**

#### UploadFile 有以下属性

filename：上传文件名字符串（str），例如， myimage.jpg；
content_type：内容类型（MIME 类型 / 媒体类型）字符串（str），例如，image/jpeg；
file： SpooledTemporaryFile（ file-like 对象）。其实就是 Python文件，可直接传递给其他预期 file-like 对象的函数或支持库。

#### UploadFile有以下`async` 方法

#### （使用内部 `SpooledTemporaryFile`）可调用相应的文件方法。

- `write(data)`：把 `data` （`str` 或 `bytes`）写入文件；

- `read(size)`：按指定数量的字节或字符（`size` (`int`)）读取文件内容；

-  `seek(offset)`：移动至文件 offset （int）字节处的位置；例如，await myfile.seek(0) 移动到文件开头；执行 await myfile.read() 后，需再次读取已读取内容时，这种方法特别好用；

- `close()`：关闭文件。

因为上述方法都是 `async` 方法，要搭配「await」使用。

例如，在 `async` *路径操作函数* 内，要用以下方式读取文件内容：

```
contents = await myfile.read()
```

在普通 `def` *路径操作函数* 内，则可以直接访问 `UploadFile.file`，例如：

```
contents = myfile.file.read()
```



## 6.异常处理

```python
@app.get("/items/{item_id}")
async def read_item(item_id: str):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"item": items[item_id]}
```

`HTTPException` 是额外包含了和 API 有关数据的常规 Python 异常。

因为是 Python 异常，所以不能 `return`，只能 `raise`。

当抛出异常时，客户端收到的格式是

```json
{
  "detail": "Item not found"
}
```

### 为 HTTP 错误添加自定义的响应头

```python
raise HTTPException(
    status_code=404,
    detail="Item not found",
    headers={"X-Error": "There goes my error"},
)
```

### 自定义异常处理

使用@app.exception_handler()注册自定义的异常处理

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class UnicornException(Exception):	 		# 1. 自定义异常类
    def __init__(self, name: str):
        self.name = name


app = FastAPI()


@app.exception_handler(UnicornException)		# 2.使用@app.exception_handler()注册，并对接后续的处理函数
async def unicorn_exception_handler(request: Request, exc: UnicornException):
    return JSONResponse(
        status_code=418,
        content={"message": f"Oops! {exc.name} did something. There goes a rainbow..."},
    )


@app.get("/unicorns/{name}")
async def read_unicorn(name: str):
    if name == "yolo":
        raise UnicornException(name=name)		# 3. 使用时直接raise自定义的类
    return {"unicorn_name": name}
```

### 覆写系统异常处理

#### 覆写请求验证异常

请求中包含无效数据时，**FastAPI** 内部会触发 `RequestValidationError`。

知道了这个异常类的名称，只需要像自定义一下，覆写一次即可

```python
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return PlainTextResponse(str(exc), status_code=400)
```

这样 原有的json错误信息

```json
{
    "detail": [
        {
            "loc": [
                "path",
                "item_id"
            ],
            "msg": "value is not a valid integer",
            "type": "type_error.integer"
        }
    ]
}
```

会被替换为

```
1 validation error
path -> item_id
  value is not a valid integer (type=type_error.integer)
```

因为exc交给PlainTextResponse了

##### 覆写RequestValidationError的应用场景

```python
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": exc.errors(), "body": exc.body}),
    )

```

调试时，覆写RequestValidationError可以查看具体的异常细节



#### 覆写HttpException

```python
from fastapi.responses import PlainTextResponse
from starlette.exceptions import HTTPException as StarletteHTTPException 	# 注意这里

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return PlainTextResponse(str(exc.detail), status_code=exc.status_code)


@app.get("/items/{item_id}")
async def read_item(item_id: int):
    if item_id == 3:
        raise HTTPException(status_code=418, detail="Nope! I don't like 3.")
    return {"item_id": item_id}
```

注册异常处理器时，应该注册到来自 Starlette 的 `HTTPException`。因为FastApi的HTTPException进行了扩充，不单是继承自Starlette,还添加了OAuth 2 等安全工具需要的响应头等。



## 7. MetaData

### 路径操作装饰器

- `status_code`

  status_code=status.HTTP_201_CREATED

- `response_class`

  默认情况下，FastAPI 使用 `JSONResponse` 作为响应类，但可以使用 `response_class` 参数来自定义响应类型。

  可根据特定需求指定自定义的响应类，以控制响应的内容类型、状态码和其他属性。这能够灵活地定义返回给客户端的响应。

- `Tags`

  `tags` 参数的值是由 `str` 组成的 `list` （一般只有一个 `str` ），`tags` 用于为*路径操作*添加标签：
  
  ```python
  @app.post("/items/", response_model=Item, tags=["items"]) 
  ```

  默认情况下**FastAPI** 概图也会自动添加标签，供 API 文档接口使用

- `Summary` 和 `description`

    ```python
    @app.post(
        "/items/",
        response_model=Item,
        summary="Create an item",
        description="Create an item with all the  information, name, description, price, tax and a set of unique tags",
    ```

  `description`也可以写在用""" """(即docstring)框起来的函数的注释中(支持markdown格式)。

    ```python
    """
    Create an item with all the information:
  
    - **name**: each item must have a name
    - **description**: a long description
    - **price**: required
    - **tax**: if the item doesn't have tax, you can omit this
    - **tags**: a set of unique tag strings for this item
    """
    ```

- `response_description`

  注意，`response_description` 只用于描述响应，`description` 一般则用于描述*路径操作*。
  
- `deprecated`

​	将接口标记为已经弃用

### FastAPI和APIRouter

- **Title**：在 OpenAPI 和自动 API 文档用户界面中作为 API 的标题/名称使用。
- **Description**：在 OpenAPI 和自动 API 文档用户界面中用作 API 的描述。
- **Version**：：API 版本，例如 `v2` 或者 `2.5.0`



`prefix`、`tags`、`responses` 以及 `dependencies` 参数只是（和其他很多情况一样）**FastAPI** 的一个用于帮助你避免代码重复的功能。

```python
@app.get("/elements/", tags=["items"], deprecated=True)
async def read_elements():
    return [{"item_id": "Foo"}]
```

- 额外的 `responses`。

用于表明该接口会响应哪几种response

- `dependencies`

​	全局依赖项，用于统一引入依赖项，这样所有的路径地址都不需要额外再引入 

- `default_response_class`

  全局响应类，用于覆写Response类，定义响应的内容类型、状态码和其他属性

## 8.依赖项

FastAPI有一个非常强大但直观的依赖注入系统

编程中的**「依赖注入」**是声明代码运行所需的，或要使用的「依赖」的一种方式。然后，由系统（本文中为 **FastAPI**）负责执行任意需要的逻辑，为代码提供这些依赖。

依赖注入常用于以下场景：

- 共享业务逻辑（复用相同的代码逻辑）
- 共享数据库连接
- 实现安全、验证、角色权限
- 等……

上述场景均可以使用**依赖注入**，将**代码重复最小化**。  <- 最主要的作用

可以把依赖项当作没有「装饰器」（即，没有 `@app.get("/some-path")` ）的路径操作函数。

### 依赖项使用注意事项

- 这里只能传给 Depends 一个参数。（多个依赖项就要多次使用Depends）

- 且该参数必须是可调用对象，比如函数。
- 不直接调用它(就是不要末尾添加括号)

- 该函数接收的参数和*路径操作函数*的参数一样。

### Annotated带来的变化

```python
CommonsDep = Annotated[dict, Depends(common_parameters)]	// 可以将Annotated 赋值给一个变量（其实不是赋值，是类型别名）


@app.get("/items/")
async def read_items(commons: CommonsDep):				// 使用更加方便
    return commons
```

### 使用类作为依赖项

当依赖项返回的值结构比较复杂时，定义一个类作为依赖项显然要比用函数更好，因为类中的参数和类型定义能被IDE读取到，而函数return的值内部结构IDE不会去猜。

```python
class CommonQueryParams:
    def __init__(self, q: str | None = None, skip: int = 0, limit: int = 100):
        self.q = q
        self.skip = skip
        self.limit = limit
```

**FastAPI** 调用 `CommonQueryParams` 类。这将创建该类的一个 "实例"，该实例将作为参数 `commons` 被传递给你的函数。和函数return 效果是一样的。

使用的时候：

```python
async def read_items(commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)]):
```

**FastAPI** Depends 执行`CommonQueryParams` 类实例化，然后Annotated又声明commons的类型为CommonQueryParams,所以这里CommonQueryParams用到了两次，这是最规范的写法。

而FastAPI也提供了简便写法，只要你定义了前面的

```python
async def read_items(commons: Annotated[CommonQueryParams, Depends()]):
```

直接用Depends即可，fastapi也能正确的调用依赖类

#### **使用类实例化出来的对象作为依赖项

使用类作为依赖项时，是调用`__init__`方法，来接收参数，并“return”一个对象。

使用类的对象作为依赖项时，是调用`__call__`方法，来接收参数，类似函数了（但是在实例化的时候已经对这个对象进行了加工可以比函数有更多功能）

### 注册全局依赖项

```python
app = FastAPI(dependencies=[Depends(verify_token), Depends(verify_key)])
```

### yield

`yield` 是 Python 的一种语法，通过 yield 语句将值返回给调用者，并且函数仍可以保持自己的状态，以便在下次调用时恢复执行。

在FastAPI中，可以在yield之后，编写额外的步骤，这样FastAPI 可以让依赖项执行完毕后，再执行更多操作。

这在数据库操作中非常有用，只需要先yield Session给Depends，在路径波函数中查询数据库，等响应返回之后，再执行 `yield` 语句之后的代码，关闭数据库

```python
async def get_db():
    db = DBSession()
    try:
        yield db
    finally:
        db.close()
```

### 为依赖项传入参数

只有类作为依赖项可以实现这个功能，因为类有`__init__`和`__call__`,使用`__init__`来传入参数，使用`__call__`在执行时传入参数

## 9.安全性/登录/鉴权

### OAuth2

OAuth2是一个规范，它定义了几种处理身份认证和授权的方法。

它是一个相当广泛的规范，涵盖了一些复杂的使用场景。

它包括了使用「第三方」进行身份认证的方法。

这就是所有带有「使用 Facebook，Google，Twitter，GitHub 登录」的系统背后所使用的机制。

### OpenID Connect

OpenID Connect 是另一个基于 **OAuth2** 的规范。

它只是扩展了 OAuth2，并明确了一些在 OAuth2 中相对模糊的内容，以尝试使其更具互操作性。

例如，Google 登录使用 OpenID Connect（底层使用OAuth2）。

但是 Facebook 登录不支持 OpenID Connect。它具有自己的 OAuth2 风格。

:::tip

FastAPI 在 fastapi.security 模块中为每个安全方案提供了几种工具，这些工具简化了这些安全机制的使用方法。

:::



### 基于OAUTH2 的登录流程

1. 用户在前端输入 `username` 与`password`，并点击**回车**
2. （用户浏览器中运行的）前端把 `username` 与`password` 发送至 API 中指定的 URL（使用 `tokenUrl="token"` 声明）
3. API 检查 `username` 与`password`，并用令牌（`Token`） 响应：
   - 令牌只是用于验证用户的字符串
     - 一般来说，令牌会在一段时间后过期
     - 过时后，用户要再次登录
     - 这样一来，就算令牌被人窃取，风险也较低。因为它与永久密钥不同，**在绝大多数情况下**不会长期有效
4. 前端临时将令牌存储在某个位置
5. 用户点击前端，前往前端应用的其它部件
6. 前端需要从 API 中获取更多数据时：
   - 为指定的端点（Endpoint）进行身份验证
   - 因此，用 API 验证身份时，要发送 `Authorization`请求头，值为 `Bearer` +空格+ Token 
   - 假如令牌为 `foobar`，`Authorization` 请求头就是： `Bearer foobar`

#### 登录（客户端发送username和password，响应token）

token 端点的响应必须是一个 JSON 对象。它应该有一个 token_type。在我们的例子中，由于我们使用的是「Bearer」令牌，因此令牌类型应为bearer。并且还应该有一个 access_token 字段，它是一个包含我们的访问令牌的字符串。

```python
@app.post("/token")
# 这里OAuth2PasswordRequestForm继承于Form类，可以从post请求中获取表单数据，这个类定义了OAUTH2的格式，包括username,password等
# 登录账号密码错误返回400
async def login(form_data: OAuth2PasswordRequestForm = Depends()):	
    user = user_crud.get_user_by_name(db, form_data.username)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="登录失败,请检查用户名和密码")
    # 加盐验证
    if not user_service.verify_password(form_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="登录失败,请检查用户名和密码")
    if user.status == 0:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="账户已被禁用，请联系管理员")
    token = await create_access_token(data={"sub": str(user.id)})
    return {"access_token": token}


# 生成token
async def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, key=config.SECRET_KEY, algorithm=config.ALGORITHM)
    return encoded_jwt
```

##### 使用JWT加密token

JWT（JSON Web Token）是一种用于在网络应用之间传递信息的标准。它由头部、载荷和签名三部分组成。

- 头部指定令牌类型和签名算法，可被任何人读取。
- 载荷包含实际传输的数据，同样可被任何人读取。
- 签名使用服务器端的密钥对“头部和载荷”进行签名，用于验证令牌的完整性和真实性。

当接收方接收到JWT令牌时，它可以使用相同的算法和密钥再次对头部和载荷进行签名，并比较生成的签名与令牌中的签名是否一致。如果一致，表示令牌未被篡改。可以信任令牌中的信息并使用其中的数据。

需要注意的是，JWT令牌的签名验证只能保证令牌的完整性，而无法保护其内容的机密性。因为令牌中的头部和载荷部分可以被任何人解码，因此不应在令牌中存储敏感的、未加密的数据。

###### 推荐python-jose

```bash
pip install "python-jose[cryptography]"
```

##### 使用hash加密登录密码

```python
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)
```

#### 请求时OAUTH2实现代码（从客户端发送的请求头中分离出token）

```python
from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()

# 在 FastAPI 的文档中，当我们创建一个 OAuth2PasswordBearer 类的实例时，需要传入 tokenUrl 参数。这个参数指定了了客户端发送用户名和密码过来（一般是POST）用以换取Token的URL。
# 指定这个 URL 的目的是让 OAuth2PasswordBearer 知道在哪里可以获取访问令牌，从而对访问令牌进行验证。
# 该参数不会创建端点或路径操作，但会声明客户端用来获取令牌的 URL /token 。此信息用于 OpenAPI 及 API 文档。
# 还需要单独定义路径操作
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")		


@app.get("/items/")
async def read_items(token: Annotated[str, Depends(oauth2_scheme)]):	# 依赖项的要求是“可执行的”，这里oauth2_scheme(some, parameters)是可执行的
    # 思考 oauth2_scheme 变量是 OAuth2PasswordBearer 的实例，也是可调用项。
    # 因为OAuth2PasswordBearer类中通过类定义时的__call__实现了callable
    # 当call时，已经实现了init中的初始化tokenUrl="token"赋值等步骤
    
    # FastAPI 校验请求中的 Authorization 请求头，核对请求头的值是不是由 Bearer ＋ 令牌组成， 并返回令牌字符串（str）。
	# 如果没有找到 Authorization 请求头，或请求头的值不是 Bearer ＋ 令牌。FastAPI 直接返回 401 错误状态码（UNAUTHORIZED）。
    return {"token": token}



# ↓ 完全实现如下 ↓
async def get_current_user(token: str = Depends(oauth2_scheme)):	# 从请求头中获取Authorization Bearer
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials",
                                          headers={"WWW-Authenticate": "Bearer"})  # 准备好错误信息，可复用。未登录返回401
    # 通常，在返回 401 状态码的同时，服务器还会在响应的头信息中包含一个 WWW-Authenticate 头字段，用于指示客户端应该使用何种身份验证方式。
    # 例如，可以使用 Bearer、 Basic Auth、Digest Auth 或其他自定义的身份验证机制。

    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


# 这样，当用户访问端点时，依赖项会从请求头中获取Authorization，然后验证取得current_user
@app.get("/users/me")
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]): 
    return current_user
```



## 10.中间件

"中间件"是一个函数,它在每个**请求**被特定的*路径操作*处理之前,以及在每个**响应**返回之前工作.

### 创建中间件

在函数的顶部使用装饰器 `@app.middleware("http")`来创建中间件

中间件参数接收如下参数:

- request.
- 一个函数 `call_next` 它将接收 request 作为参数.
  - 这个函数将 request 传递给相应的 路径操作.
  - 然后它将返回由相应的路径操作生成的 response.

- 然后你可以在返回 response 前进一步修改它.

```python
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

在app中引入中间件

```python
# 引入中间件
app.add_middleware(myMiddleware, some_config="rainbow")
# 使用 app.middleware 方法时，它会检查传递给它的参数的类型。如果参数是一个函数，它将被视为函数形式的中间件。如果参数是一个类，它将被视为类形式的中间件。
# 对于函数形式的中间件，app.middleware 方法会将函数直接添加到 FastAPI 应用程序的中间件列表中。这样，当请求进入应用程序时，每个中间件函数都会按照它们在列表中的顺序依次被调用。

# 对于类形式的中间件，app.middleware 方法会创建中间件类的实例，并将应用程序实例作为参数传递给中间件类的 __init__ 方法。然后，它将中间件类的实例作为中间件对象添加到 FastAPI 应用程序的中间件列表中。当请求进入应用程序时，每个中间件对象的 __call__ 方法都会被调用。
```

### 内部集成的中间件介绍

- `CORSMiddleware`：下一章单独讲
- `HTTPSRedirectMiddleware`：强制规定所有传入的请求必须是https或wss。任何传入的对http或ws的请求都将被重定向到安全方案"s"上。

- `TrustedHostMiddleware`：用于验证传入请求的主机（host）是否可信。它用于防止 HTTP Host Header 攻击和 Host Header 欺骗。
- `GZipMiddleware`:它会自动检查响应的内容类型和大小。对于适合进行压缩的响应（如文本内容、JSON 数据等），`GZipMiddleware` 会在发送响应之前将其压缩为 Gzip 格式，并在响应的头部中添加相应的压缩信息。

## 11.CORS

CORS 或者「跨源资源共享」 指浏览器中运行的前端拥有与后端通信的 JavaScript 代码，而后端处于与前端不同的「源」的情况。

前后端分离的项目肯定需要CORS

当浏览器发起跨域请求时，如果请求方法为复杂请求（例如 PUT、DELETE、自定义的 HTTP 方法）或包含自定义请求头，浏览器会先发送一个预检请求。预检请求使用 OPTIONS 方法，并包含 Origin 头（表示请求的来源）和 Access-Control-Request-Method 头（表示实际请求的方法）。

CORS 中间件会拦截预检请求，并根据配置的 CORS 规则生成适当的响应头，以告知浏览器服务器是否允许实际请求的发送。

如果服务器允许该请求，会返回一个带有 CORS 响应头的 200 响应。如果服务器不允许该请求，会返回一个带有 CORS 响应头的 400 响应，以提供相应的错误信息。

### 源的定义

源是协议（`http`，`https`）、域（`myapp.com`，`localhost`，`localhost.tiangolo.com`）以及端口（`80`、`443`、`8080`）的组合。	

因此，这些都是不同的源：

- `http://localhost`
- `https://localhost`
- `http://localhost:8080`

假设你的浏览器中有一个前端运行在 `http://localhost:8080`，并且它的 JavaScript 正在尝试与运行在 `http://localhost` 的后端通信（因为我们没有指定端口，浏览器会采用默认的端口 `80`）。

然后，浏览器会向后端发送一个 HTTP `OPTIONS` 请求，如果后端发送适当的 headers 来授权来自这个不同源（`http://localhost:8080`）的通信，浏览器将允许前端的 JavaScript 向后端发送请求。

为此，后端必须有一个「允许的源」列表。

### 使用`CORSMiddleware`解决CORS

```python
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,		# 允许跨域请求的源列表
    allow_credentials=True,		# 指示跨域请求支持 cookies。默认是 False。另外，当为True时，allow_origins 不能设定为 ['*']，必须指定源。
    allow_methods=["*"],		# 允许跨域请求的 HTTP 方法列表,默认只有 ['GET']
    allow_headers=["*"],		# 允许跨域请求的 HTTP 请求头列表。默认为 [空]
)
```

`CORSMiddleware` 在 FastAPI 中是一个中间件，它对每个传入的请求进行处理。以下是 `CORSMiddleware` 对请求所做的一些操作：

1. 检查请求是否为跨域请求：`CORSMiddleware` 首先检查传入的请求是否是跨域请求。它会查看请求的来源（Origin）头是否存在，并与配置中的允许来源进行匹配。
2. 处理预检请求：如果请求是预检请求（OPTIONS 请求），`CORSMiddleware` 会生成适当的 CORS 响应头，并返回一个响应。这个响应中包含了配置中指定的允许的请求方法（allow_methods）和请求头（allow_headers）等信息。
3. 处理实际请求：如果请求不是预检请求，`CORSMiddleware` 会在响应中添加 CORS 响应头，以允许跨域访问。这些响应头包括允许的来源（allow_origins）、允许发送身份验证信息（allow_credentials）、允许的请求方法（allow_methods）和请求头（allow_headers）等。
4. 添加 CORS 响应头：`CORSMiddleware` 将根据配置中的允许来源、允许发送身份验证信息等设置，在响应中添加适当的 CORS 响应头。这些响应头包括 `Access-Control-Allow-Origin`、`Access-Control-Allow-Credentials`、`Access-Control-Allow-Methods`、`Access-Control-Allow-Headers` 等。

## 12.SQL数据库

### sqlalchemy 配置

#### SQLite

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"	# 第一步，定义URL
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"

engine = create_engine(    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}) # 第二步，创建一个 SQLAlchemy的“引擎”。

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) # 第三步，创建一个SessionLocal类

Base = declarative_base()	# 第四步，创建一个Base类，我们将用这个类继承，来创建每个数据库模型或类（ORM 模型）
```

#### MySql

```python
from sqlalchemy import create_engine
# from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import sessionmaker
from app.config import config
from sqlalchemy.pool import QueuePool

# 创建一个 SQLAlchemy的“引擎”。稍后会将这个engine在其他地方使用。
pool_size = 10
max_overflow = 20
engine = create_engine(config.DATABASE_URL, echo=True, poolclass=QueuePool, pool_size=pool_size, max_overflow=max_overflow, pool_pre_ping=True, pool_recycle=3600)
# 每个实例SessionLocal都会是一个数据库会话。当然该类本身还不是数据库会话。
# 但是一旦我们创建了一个SessionLocal类的实例，这个实例将是实际的数据库会话。
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, )

Base = declarative_base()

```

### 创建Models

```python
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    items = relationship("Item", back_populates="owner")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="items")
```

### 创建Schema

```python
from pydantic import BaseModel


class ItemBase(BaseModel):
    title: str
    description: str | None = None


class ItemCreate(ItemBase):
    pass


class Item(ItemBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True
```

### 定义CRUD

### 创建依赖项

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## 13.后台任务

**FastAPI** 可以定义返回响应后 运行的后台任务

比如：

- email发送： 可以立即返回响应并在后台发送电子邮件通知。
- 处理数据： 例如，假设您收到一个必须经过缓慢处理的文件，您可以返回“已接受”（HTTP 202）的响应并在后台处理它。

```python
from fastapi import BackgroundTasks


def write_notification(email: str, message=""):
    with open("log.txt", mode="w") as email_file:
        content = f"notification for {email}: {message}"
        email_file.write(content)


@app.post("/send-notification/{email}")
async def send_notification(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(write_notification, email, message="some notification")
    return {"message": "Notification sent in the background"}

```

注意：
如果需要执行繁重的后台计算并且不一定需要它由同一进程运行（例如，不需要共享内存、变量等），可能会受益于使用其他更大的工具，例如Celery。
它们往往需要更复杂的配置，消息/作业队列管理器，如 RabbitMQ 或 Redis，但它们允许在多个进程中运行后台任务，尤其是在多个服务器中。
要查看示例，请查看Project Generators，它们都包含已配置的 Celery。
但是，如您需要从同一个FastAPI应用程序访问变量和对象，或者需要执行小型后台任务（例如发送电子邮件通知），只需使用BackgroundTasks.

### 新建一个任务函数

任务函数是能接收参数的标准函数。

### 声明 `BackgroundTasks` 类型的*路径操作函数*参数

```python
async def send_notification(email: str, background_tasks: BackgroundTasks):
```

### 添加后台任务

在*路径操作函数*中，使用 `.add_task()` 方法把任务函数和参数传递给*后台任务*对象

```python
background_tasks.add_task(write_notification, email, message="some notification")
```



## 14.静态文件目录

```python
from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="static"), name="static")
#  /static是要挂载的子应用的路径。因此，挂载子应用会处理所有以 /static 开头的路径。
#  directory="static" 是静态文件在本地的文件夹。
#  name="static" 用于指定 FastAPI 内部使用的名称。
```





## 15.自定义响应

当创建 FastAPI 路径操作时，通常可以从中返回任何数据：字典、列表、Pydantic 模型、数据库模型等。

然后，它会将 JSON 兼容的数据（例如字典）放入 JSONResponse 中（将return的内容放入该 JSONResponse 的`content`参数中），用于将响应发送给客户端。

**也可以直接返回一个JSONResponse，并自定义其中的header，cookies,status_code等，当检测到return的是一个Response或者它的子类时，fastapi不会再做额外的加工转换操作，而是直接响应给客户端**

使用jsonable_encoder，将复杂的数据格式转换为客户端可以读取的json格式

### 定义status_code

1.使用路由装饰器：可以在路由装饰器中使用`status_code`参数来指定响应的状态码。

```python
@app.get("/items/{item_id}", status_code=201)
```

2.抛出`HTTPException`异常：可以在路由处理函数中抛出`HTTPException`异常，并在异常中指定状态码。

```python
raise HTTPException(status_code=404, detail="Item not found")
```

3.直接返回响应对象，可以通过直接返回 Response（如 JSONResponse）并直接设置其他状态代码来实现。

```python
return JSONResponse(status_code=404, content={"message": "Item not found"})
```



### 可在多处定义响应信息文档（openapi），并合并

**FastAPI** 支持合并 `response_model`、`status_code`、`responses` 参数等多个位置的响应信息。

`responses`参数用于定义不同状态码下的响应模型和描述。

`responses`参数允许你在路由处理函数中为不同的状态码提供自定义的响应模型和描述信息。它是一个包含状态码和响应模型的字典。

其中键是状态码，值是一个包含`model`和`description`的字典。`model`指定了响应的数据模型，可以是一个Pydantic模型类，而`description`是对该状态码的描述信息。

```python
@app.get("/items/{item_id}", 
    response_model=Item,		# 这里的response_model 指定的是code200，会和responses中的200条目合并
    responses={
        200: {"model": Item, "description": "Success"},
        404: {"model": Message, "description": "Item not found"},
})
```



### 定义响应类，以返回HTML，流，文件，其他。

默认情况下，FastAPI 使用 `JSONResponse` 作为响应类，但可以使用 `response_class` 参数来自定义响应类型。

可根据特定需求指定自定义的响应类，以控制响应的内容类型、状态码和其他属性。这能够灵活地定义返回给客户端的响应。

#### `Response`

所有其他的响应都继承自它。
你可以直接返回它。
它接受以下参数：

- content - 一个字符串或字节。

- status_code - 一个int HTTP状态代码。

- headers - 一个字符串的dict。

- media_type - 一个给出媒体类型的字符串。例如："text/html"。

FastAPI（实际上是Starlette）将自动包括一个Content-Length头。它还将包括一个Content-Type头，基于media_type并为文本类型附加一个字符集。

#### `HTMLResponse`和`PlainTextResponse`

返回html网页和纯文本，其实就是在Response类中声明了media_type

```python
class HTMLResponse(Response):
    media_type = "text/html"

class PlainTextResponse(Response):
    media_type = "text/plain"
```

#### `JSONResponse`

默认响应类，也会猜测一下return的类型，如果是dict等类型，会转换为json

#### `ORJSONResponse`和`UJSONResponse`

- `orjson` 库在性能方面表现出色，比 `json` 和 `ujson` 更快。

#### `RedirectRespons`

返回status_code: int = 307,

```python
@app.get("/typer")
async def redirect_typer():
    return RedirectResponse("https://typer.tiangolo.com")
```

或者

```python
@app.get("/fastapi", response_class=RedirectResponse)
async def redirect_fastapi():
    return "https://fastapi.tiangolo.com"
```

都是可以的

#### `StreamingResponse`

流式传输响应体。

```python
async def fake_video_streamer():
    for i in range(10):
        yield b"some fake video bytes"


@app.get("/")
async def main():
    return StreamingResponse(fake_video_streamer())
```

或
```python
@app.get("/")
def main():
    def iterfile():  # 
        with open(some_file_path, mode="rb") as file_like:  # 
            yield from file_like  # 

    return StreamingResponse(iterfile(), media_type="video/mp4")
```

#### `FileResponse`

一个高度集成的流式文件响应体，将以块大小=64kb发送文件。

```python
@app.get("/", response_class=FileResponse)
async def main():
    return some_file_path	# 可以直接从路径操作函数返回本地文件路径
```

文件响应将包括适当的 Content-Length、Last-Modified 和 ETag 标头。

### 定义Cookies和headers

```python
@app.post("/cookie/")
def create_cookie():
    content = {"message": "Come to the dark side, we have cookies"}
    headers = {"X-Cat-Dog": "alone in the world", "Content-Language": "en-US"}
    response = JSONResponse(content=content, headers=headers)					# 新建response  直接装入headers
    response.set_cookie(key="fakesession", value="fake-cookie-session-value")	# 通过set_cookie 设置key:value
    return response															
```

另一种方法（更好看好用），在路径函数中添加参数：

```python
@app.post("/cookie-and-object/")
def create_cookie(response: Response):	# 直接添加response参数，这样就生成了一个临时的response
    response.set_cookie(key="fakesession", value="fake-cookie-session-value")	# 对这个response做加工，通过set_cookie 设置key:value
    response.headers["X-Cat-Dog"] = "alone in the world"						# 通过header设置，注意header是个字典，可以直接用[]操作
    return {"message": "Come to the dark side, we have cookies"}	# 只需要做正常的return，fastapi会将临时的response合并入正式的响应中
```

## 16.Mount 挂载子应用

在静态应用中已经用到过mount

```python
app.mount("/static", StaticFiles(directory="static"), name="static")
```

Mount与使用APIRouter不同，因为挂载的应用程序是完全独立的。

主应用程序中的 OpenAPI 和文档不会包含Mount的应用程序的任何内容。

** FastAPI将使用ASGI规范中的一个称为root_path的机制来处理子应用程序的挂载路径。所以子应用是知道主应用所在的rootpath的

## 17.WebSocket

前端JS代码：

```html
<script>
    var ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = function(event) {
        var messages = document.getElementById('messages')
        var message = document.createElement('li')
        var content = document.createTextNode(event.data)
        message.appendChild(content)
        messages.appendChild(message)
    };
    function sendMessage(event) {
        var input = document.getElementById("messageText")
        ws.send(input.value)
        input.value = ''
        event.preventDefault()
    }
</script>
```

fastapi后端代码：

```python
# 监听ws
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()		# 接受连接。此方法将发送一个HTTP响应，其中包含一个Sec-WebSocket-Accept头，该头包含一个经过验证的Sec-WebSocket-Key值
    while True:
        data = await websocket.receive_text()	# 一直等待接收
        await websocket.send_text(f"Message text was: {data}")	# 响应
```

```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)	# 加入活动列表中

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)	# 移出活动列表

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()	


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"You wrote: {data}", websocket)
            await manager.broadcast(f"Client #{client_id} says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} left the chat")
```

## 18.生命周期事件

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model
    ml_models["answer_to_everything"] = fake_answer_to_everything_ml_model
    yield
    # Clean up the ML models and release the resources
    ml_models.clear()


app = FastAPI(lifespan=lifespan)	# 在创建Fastapi时声明
```

新版本中对生命周期进行了简化（使用yield），只需要定义一个异步上下文管理器，在函数中yield之前的部分是on_event(startup)，yield之后的部分是on_event(shutdown)

## 19.环境变量设置

在linux系统中

- 临时设置：使用export命令，例如：

```bash
export MY_NAME="Wade Wilson"
```

这种方法只在当前终端有效。


  - 当前用户的全局设置：~/.bashrc文件
  
  - 所有用户的全局设置：/etc/profile文件
  - 修改完成后执行`source ~/.bashrc`

### 使用os库读取环境变量

```python
import os

name = os.getenv("MY_NAME", "World")
```

### 使用pydantic的BaseSettings读取环境变量

```python
from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Awesome API"
    admin_email: str
    items_per_user: int = 50
    
settings = Settings()
```

BaseSettings在构造的时候会用os库读取类属性名对应的环境变量,非常方便

### linux快捷设置多个环境变量

```bash
VAR1=value1 VAR2=value2 mycommand	# 在Linux中，可以在命令前设置环境变量，这些变量只对该命令有效。
```

所以可以用以下命令启动uvicorn 并传入环境变量:

```python
ADMIN_EMAIL="deadpool@example.com" APP_NAME="ChimichangApp" uvicorn main:app
```

### 将配置项的读取放入Depends中

```python
@lru_cache()		# 放入缓存，下次再调用这个接口时将直接返回，可以有效较少IO次数
def get_settings():
    return Settings()


async def info(settings: Annotated[Settings, Depends(get_settings)]):	# 要用的时候就可以通过Depends读取了，更易读
```

### 使用.env文件配置环境变量

如果你有很多变量需要设置，那使用文件的方式肯定更好，这些环境变量通常放在一个文件 .env 中

pydantic的BaseSettings类自带可以读取.env文件的方法：

```python
from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Awesome API"
    admin_email: str
    items_per_user: int = 50

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'		# 默认就是，不写也可以
```

