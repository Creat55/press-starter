# FastAPI学习

# 1.请求

## async介绍

<https://fastapi.tiangolo.com/async/#in-a-hurry>

## 路径参数

```python
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}
# item_id 的值被声明为int 类型，并将作为参数 item_id 传递给你的函数。

# 亦带有数据校验功能，当声明为int时，传入非int类型将直接返回HTTP错误

```

### 预设值

如果你有一个接收路径参数的路径操作，但你希望预先设定可能的有效参数值，则可以使用标准的 Python `Enum` 类型。

#### 创建一个 `Enum` 类

导入 `Enum` 并创建一个继承自 `str` 和 `Enum` 的子类。

通过从 `str` 继承，API 文档将能够知道这些值必须为 `string` 类型并且能够正确地展示出来。

然后创建具有固定值的类属性，这些固定值将是可用的有效值：

```python
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

## 查询参数

查询字符串是键值对的集合，这些键值对位于 URL 的 `？` 之后，并以 `&` 符号分隔。

声明不属于路径参数的其他函数参数时，它们将被自动解释为"查询字符串"参数

```python
@app.get("/items/")
async def read_item(skip: int = 0, limit: int = 10):
    return xxx
```

...查询参数为：
skip：对应的值为 0
limit：对应的值为 10
由于它们是 URL 的一部分，因此它们的"原始值"是字符串。
但是，当你为它们声明了 Python 类型（在上面的示例中为 int）时，它们将转换为该类型并针对该类型进行校验。

由于查询参数不是路径的固定部分，因此它们可以是可选的，并且可以有默认值。

### 可选参数

通过同样的方式，你可以将它们的默认值设置为 `None` 来声明可选查询参数：

```python
from typing import Union
from fastapi import FastAPI
app = FastAPI()
@app.get("/items/{item_id}")
async def read_item(item_id: str, q: Union[str, None] = None):
  if q:
    return {"item_id": item_id, "q": q}
  return {"item_id": item_id}` 
```

在这个例子中，函数参数 `q` 将是可选的，并且默认值为 `None`。

最初的版本使用Union\[str | None]来声明，后续的python可以通过从类型模块中导入和使用Optional来声明，或者使用更简单的q : str | None = None

### bool类型的参数

你还可以声明 `bool` 类型，它们将被自动转换：

```python
http://127.0.0.1:8000/items/foo?short=1
# 或
http://127.0.0.1:8000/items/foo?short=True
# 或
http://127.0.0.1:8000/items/foo?short=true
# 或
http://127.0.0.1:8000/items/foo?short=on
# 或
http://127.0.0.1:8000/items/foo?short=yes
# 或任何其他的变体形式（大写，首字母大写等等），你的函数接收的 short 参数都会是布尔值 True。
# 对于值为 False 的情况也是一样的。
```

### 额外的校验

我们打算添加约束条件：即使 `q` 是可选的，但只要提供了该参数，则该参数值**不能超过50个字符的长度**。

```python
from typing import Union
from fastapi import FastAPI, Query

app = FastAPI()
@app.get("/items/")
async def read_items(q: Union[str, None] = Query(default=None, max_length=50)):
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
    if q:
        results.update({"q": q})
    return results

```

为此，首先从 `fastapi` 导入 `Query`

### 别名参数

假设你想要查询参数为 item-query。
像下面这样：

```http
http://127.0.0.1:8000/items/?item-query=foobaritems

```

但是 item-query 不是一个有效的 Python 变量名称。
这时你可以用 `alias` 参数声明一个别名，该别名将用于在 URL 中查找查询参数值：

```python
@app.get("/items/")
async def read_items(q: Union[str, None] = Query(default=None, alias="item-query")):
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
    if q:
        results.update({"q": q})
    return results
```

***

## 请求体

> 你不能使用 `GET` 操作（HTTP 方法）发送请求体。要发送数据，你必须使用下列方法之一：`POST`（较常见）、`PUT`、`DELETE` 或 `PATCH`。

-   首先，你需要从 pydantic 中导入 BaseModel：
-   然后，将你的数据模型声明为继承自 BaseModel 的类。
-   使用与声明路径和查询参数的相同方式声明请求体，即可将其添加到「路径操作」中：

```python
from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    description: Union[str, None] = None
    price: float
    tax: Union[float, None] = None

app = FastAPI()

@app.post("/items/")
async def create_item(item: Item):
    return item
```

> 仅仅使用了 Python 类型声明，FastAPI 将会：
> 将请求体作为 JSON 读取。
> 转换为相应的类型（在需要时）。
> 校验数据。
> 如果数据无效，将返回一条清晰易读的错误信息，指出不正确数据的确切位置和内容。
> 将接收的数据赋值到参数 item 中。
> 由于你已经在函数中将它声明为 Item 类型，你还将获得对于所有属性及其类型的一切编辑器支持（代码补全等）。
> 为你的模型生成 JSON 模式 定义，你还可以在其他任何对你的项目有意义的地方使用它们。
> 这些模式将成为生成的 OpenAPI 模式的一部分，并且被自动化文档 UI 所使用。

太爽了！

### 嵌入请求体参数（嵌入单个请求体参数）

```python
@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item = Body(embed=True)):
    results = {"item_id": item_id, "item": item}
    return resultS

```

默认的embed为false。当定义为True（就算只有单个）或有多个请求体参数时，**FastAPI** 将期望像这样的请求体：

```json
{
    "item": {
        "name": "Foo",
        "description": "The pretender",
        "price": 42.0,
        "tax": 3.2
    }
}
```

## Field,Query,Path,Body的区分

在对pydantic校验时，使用Field

```python
from pydantic import BaseModel,Field

class User(BaseModel)：
  name :str = Field(min_length=3,default="creat")

```

在对路径参数和查询参数校验时，分别使用Path,Query

```python
from FastApi import Path,Query
```

配置请求体用Body

***

## 表单数据

接收的不是json而是表单数据时，要使用Form

```python
from FastApi import Form

@app.post("/login/")
async def login(username: str = Form(), password: str = Form()):
    return {"username": username}


```

## 请求参数汇总

-   `Path`：
    -   `description`: 参数的描述
    -   `min_length`：参数最小长度限制
    -   `max_length`：参数最大长度限制
    -   `regex`: 参数的正则表达式验证规则

```python
@app.get('/items/{item_id}')
async def read_item(item_id: int = Path(..., title='The ID of the item to get', ge=1, le=1000, description='The ID must be greater than 0 and less than or equal to 1000')):
  return {"item_id": item_id}`
```

-   `Query`:
    -   `alias`: 更改名称以适应Python变量的语法
    -   `default`: 将参数定义为可选，默认值
    -   `description`: 参数的描述
    -   `min_length`：参数最小长度限制
    -   `max_length`：参数最大长度限制
    -   `gt`: 参数最小值限制
    -   `lt`: 参数最大值限制

```python
@app.get('/items/')
async def read_items(q: Optional[str] = Query(None, alias='item-query', title='Query string', min_length=3, description='Query string for the items to search in the database that have a good match')):
  return {"q": q}
```

-   `Body`:
    -   `embed`：从RequestBody中提取出Action传进来的对象，等同于json.loads(request.payload.decode('utf8'))
    -   `example`: 使用请求体中的JSON示例来生成OpenAPI文档
    -   `media_type`: 请求正文的MIME类型
    -   `default`: 设置请求正文的默认值

Copy code

\`from fastapi import FastAPI, Body

app = FastAPI()

@app.put('/items/{item\_id}')

async def update\_item(item\_id: int, name: str = Body(..., embed=True, example='Nike Shoes', min\_length=1)):

return {"item\_id": item\_id, "name": name}\`&#x20;

***

# 2.响应

## 响应模型

可以在任意的*路径操作*中使用 `response_model` 参数来声明用于响应的模型

```python
class Item(BaseModel):
    name: str
    description: Union[str, None] = None
    price: float
    tax: Union[float, None] = None
    tags: List[str] = []

@app.post("/items/", response_model=Item)
async def create_item(item: Item) -> Any:
    return item

@app.get("/items/", response_model=List[Item])
async def read_items() -> Any:
    return [
        {"name": "Portal Gun", "price": 42.0},
        {"name": "Plumbus", "price": 32.0},
    ]
```

> 将输出数据转换为其声明的类型。
> 校验数据。
> 在 OpenAPI 的路径操作中为响应添加一个 JSON Schema。
> 并在自动生成文档系统中使用。

相当于格式又过了一遍筛，不要的字段都会被去除。

### response\_model\_exclude\_unset 参数

为True时，响应中将不会包含那些默认值，而是仅有实际设置的值。

### response\_model\_include 和 response\_model\_exclude

可以配置在响应模型中仅包含或者排除哪些字段

如果你只有一个 Pydantic 模型，并且想要从输出中移除一些数据，则可以使用这种快捷方法。

***

## 响应状态码

可以在任意的\_路径操作\_中使用 `status_code` 参数来声明用于响应的 HTTP 状态码：

所有的状态码信息保存在 `fastapi.status` 的便捷变量。

```python
from fastapi import status
```

# 3.错误处理

向客户端返回 HTTP 错误响应，可以使用 `HTTPException`

```python
from fastapi import FastAPI, HTTPException
app = FastAPI()
items = {"foo": "The Foo Wrestlers"}

@app.get("/items/{item_id}")
async def read_item(item_id: str):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"item": items[item_id]}
```

### 自带的异常处理器

请求中包含无效数据时，**FastAPI** 内部会触发 `RequestValidationError`。

### 添加自定义的异常处理器

可以用 `@app.exception_handler()` 添加自定义异常控制器

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

class UnicornException(Exception):
    def __init__(self, name: str):
        self.name = name
        
@app.exception_handler(UnicornException)
async def unicorn_exception_handler(request: Request,exc: UnicornException):# 两个参数必要
    return JSONResponse(
        status_code=418,
        content={"message": f"Oops! {exc.name} did something. There goes a rainbow..."},
    )
```

抛出异常：

```python
raise UnicornException(name=name)
```

# 4.路径装饰器的其它一些参数配置

除了定义响应模型中用到的一些配置，装饰器中还存在一些其它配置

status\_code用于定义响应中的 HTTP 状态码

tags参数的值是由 str 组成的 List 用于为路径操作添加标签，供 API 文档接口使用

summary 和 description 供 API 文档接口使用

响应描述 response\_description 参数用于定义响应的描述说明

已弃用描述 deprecated 参数可以把路径操作标记为弃用，无需直接删除

***

# 5.依赖项（叫组件更贴切）

### 创建依赖项

依赖项就是一个函数，且可以使用与路径操作函数相同的参数：

```python
from typing import Optional
from fastapi import Depends, FastAPI
app = FastAPI()


async def common_parameters(q: Optional[str] = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

@app.get("/items/")
async def read_items(commons: dict = (common_parameters)):
    return commons

@app.get("/users/")
async def read_users(commons: dict = Depends(common_parameters)):
    return commons

```

依赖项可以返回各种内容。

## 导入 Depends

### 声明依赖项

与在*路径操作函数*参数中使用 `Body`、`Query` 的方式相同，声明依赖项需要使用 `Depends` 和一个新的参数：

```python
@app.get("/users/")
async def read_users(commons: dict = Depends(common_parameters)):
    return commons

```

**强调！****这里只能传给 Depends 一个参数****。**

**且该参数必须是可调用对象，比如函数。**

**该函数接收的参数和\_路径操作函数\_的参数一样。**

通过依赖注入系统，只要告诉 **FastAPI** *路径操作函数* 还要「依赖」其他在*路径操作函数*之前执行的内容，**FastAPI** 就会执行函数代码，并「注入」函数返回的结果。

## 类作为依赖项

Python 中的 "可调用对象" 是指任何 Python 可以像函数一样 "调用" 的对象。
即可以加上括号（）来执行的对象，包括函数，类等

你可以使用一个 Python 类作为一个依赖项，这样可以获得类中的元素及方法的IDE提示

```python
class CommonQueryParams:
    def __init__(self, q: str | None = None, skip: int = 0, limit: int = 100):
        self.q = q
        self.skip = skip
        self.limit = limit

@app.get("/items/")
async def read_items(commons: CommonQueryParams = Depends(CommonQueryParams)):
    response = {}
    if commons.q:
        response.update({"q": commons.q})
    items = fake_items_db[commons.skip : commons.skip + commons.limit]
    response.update({"items": items})
    return response


```

类中的\_\_init\_\_ 或者之前定义函数的参数，都是 **FastAPI** 用来 "处理" 依赖项的。

都有：

-   一个可选的 `q` 查询参数，是 `str` 类型。
-   一个 `skip` 查询参数，是 `int` 类型，默认值为 `0`。
-   一个 `limit` 查询参数，是 `int` 类型，默认值为 `100`。

#### 类依赖项简写

```python
async def read_items(commons: CommonQueryParams = Depends()):

```

# 6.认证与安全

## 解析token

FastAPI 在 `fastapi.security` 模块中为每个安全方案提供了几种工具，这些工具简化了这些安全机制的使用方法。

fastAPI的认证流程：

```python
from fastapi import Depends, FastAPI
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.get("/items/")
async def read_items(token: str = Depends(oauth2_scheme)):
    return {"token": token}

# 思考 oauth2_scheme 变量是 OAuth2PasswordBearer 的实例，也是可调用项。
# 应该是通用类定义时的__call__实现了此功能
# 当call时，已经实现了init中的初始化tokenUrl="token"赋值等步骤
```

-   用户在前端输入 `username` 与`password`，并点击**回车**
-   （用户浏览器中运行的）前端把 `username` 与`password` 发送至 API 中指定的 URL（使用 `tokenUrl="token"` 声明）
-   API 检查 `username` 与`password`，并用令牌（`Token`） 响应
-   令牌只是用于验证用户的字符串
-   一般来说，令牌会在一段时间后过期
    -   过时后，用户要再次登录
    -   这样一来，就算令牌被人窃取，风险也较低。因为它与永久密钥不同，**在绝大多数情况下**不会长期有效
-   前端临时将令牌存储在某个位置
-   用户点击前端，前往前端应用的其它部件
-   前端需要从 API 中提取更多数据：
    -   为指定的端点（Endpoint）进行身份验证
    -   因此，用 API 验证身份时，要发送值为 `Bearer` + 令牌的请求头 `Authorization`
    -   假如令牌为 `foobar`，`Authorization` 请求头就是： `Bearer foobar`

### OAuth2PasswordBearer

本例使用 **OAuth2** 的 **Password** 流以及 **Bearer** 令牌（`Token`）。为此要使用 `OAuth2PasswordBearer` 类。

创建 `OAuth2PasswordBearer` 的类实例时，要传递 `tokenUrl` 参数。该参数包含客户端（用户浏览器中运行的前端） 的 URL，用于发送 `username` 与 `password`，并获取令牌。

该参数不会创建端点或路径操作，但会声明客户端用来获取令牌的 URL `/token` 。此信息用于 OpenAPI 及 API 文档。

### 实现的操作

FastAPI 校验请求中的 `Authorization` 请求头，核对请求头的值是不是由 `Bearer` ＋ 令牌组成， 并返回令牌字符串（`str`）。

如果没有找到 `Authorization` 请求头，或请求头的值不是 `Bearer` ＋ 令牌。FastAPI 直接返回 401 错误状态码（`UNAUTHORIZED`）。

#### 401「未认证」HTTP（错误）状态码都应该返回 `WWW-Authenticate` 响应头，也是规范的一部分

```python
async def get_current_user(token: str = Depends(oauth2_scheme)):
    user = fake_decode_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


```

## 生成token  【使用密码和 Bearer 的简单 OAuth2()】

OAuth2 规定在使用时，客户端/用户必须将 **`username`**\*\* **和 **`password`**** **字段作为**表单\*\*数据发送。而且规范明确了字段必须这样命名。

```python
# 定义一个账号密码换取token的视图
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user_dict = fake_users_db.get(form_data.username)
    if not user_dict:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    user = UserInDB(**user_dict)
    # 再对密码进行hash校验
    hashed_password = fake_hash_password(form_data.password)
    if not hashed_password == user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    # 验证成功，生成token并返回
    return {"access_token": user.username, "token_type": "bearer"}

```

### 返回的Token细节说明

`token` 端点的响应必须是一个 JSON 对象。它应该有一个 `token_type`。在我们的例子中，由于我们使用的是「Bearer」令牌，因此令牌类型应为`bearer`。并且还应该有一个 `access_token` 字段，它是一个包含我们的访问令牌的字符串。

上面示例中直接以username做为token返回

## 完整实现OAuth2与 Bearer JWT 令牌验证

#### JWT 简介

> JWT 即**JSON 网络令牌**（JSON Web Tokens）。
> JWT 是一种将 JSON 对象编码为没有空格，且难以理解的长字符串的标准。

> JWT 字符串没有加密，任何人都能用它恢复原始信息。
> 但 JWT 使用了签名机制。接受令牌时，可以用签名校验令牌。
> 使用 JWT 创建有效期为一周的令牌。第二天，用户持令牌再次访问时，仍为登录状态。
> 令牌于一周后过期，届时，用户身份验证就会失败。只有再次登录，才能获得新的令牌。如果用户（或第三方）篡改令牌的过期时间，因为签名不匹配会导致身份验证失败。

### 用户登录时，验证流程大纲

创建三个工具函数，其中

第一个函数对来自用户的密码进行哈希处理。

第二个函数用于校验接收的密码是否匹配存储的哈希值。

第三个函数用于身份验证，并返回用户

```python
# 1 哈希加密
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password):
    return pwd_context.hash(password)

# 2 哈希对比
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 3.1
def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

# 3 登录时的身份验证
def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

```

```python
# 生成token
def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

```

```python
# 对携带的jwt令牌 进行验证
from jose import JWTError, jwt

# 可以使用 openssl rand -hex 32 随机生成key
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
# 指定 JWT 令牌签名算法的变量ALGORITHM为HS256
ALGORITHM = "HS256"
# 设置令牌过期时间
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
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
```

# 7.中间件与CORS

"中间件"是一个函数,它在每个**请求**被特定的\_路径操作\_处理之前,以及在每个**响应**返回之前工作.

-   它接收你的应用程序的每一个**请求**.
-   然后它可以对这个**请求**做一些事情或者执行任何需要的代码.
-   然后它将**请求**传递给应用程序的其他部分 (通过某种\_路径操作\_).
-   然后它获取应用程序生产的**响应** (通过某种\_路径操作\_).
-   它可以对该**响应**做些什么或者执行任何需要的代码.
-   然后它返回这个 **响应**.

要**创建**中间件你可以在函数的顶部使用装饰器 `@app.middleware("http")`.

```python
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

```

## 跨域配置

你可以在 **FastAPI** 应用中使用 `CORSMiddleware` 来配置它。

-   导入 `CORSMiddleware`。
-   创建一个允许的源列表（由字符串组成）。
-   将其作为「中间件」添加到你的 **FastAPI** 应用中。

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 允许的源的列表
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def main():
    return {"message": "Hello World"}
```

# 8.数据库

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 定义数据库 URL地址
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"

# 创建一个 SQLAlchemy的“引擎”。稍后会将这个engine在其他地方使用。
# connect_args={"check_same_thread": False}只需要在Sqlite中配置
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
# 每个实例SessionLocal都会是一个数据库会话。当然该类本身还不是数据库会话。
# 但是一旦我们创建了一个SessionLocal类的实例，这个实例将是实际的数据库会话。
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
```

### CRUD utils

一般会将与数据库中的数据进行交互的函数放在一个py文件中方便重用与修改

**CRUD**分别为：**增加**、**查询**、**更改**和**删除**，即增删改查。

```python
# crud.py
from sqlalchemy.orm import Session
from . import models, schemas


# sqlalchemy2.0 语法有修改，需要留意
# 现已改为session.execute(select(User).filter(User.id == user.id)).scalar()
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()
    # or
    # return db.get(User,user_id)

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()
    # return db.execute(select(User).filter(User.email == email)）.scalar()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(email=user.email, hashed_password=fake_hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Item).offset(skip).limit(limit).all()


def create_user_item(db: Session, item: schemas.ItemCreate, user_id: int):
    db_item = models.Item(**item.dict(), owner_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)    # don't forget refresh
    return db_item



```

## 使用 Pydantic 的orm\_mode

在用于查询的 Pydantic模型中，添加一个内部Config类。
此类Config用于为 Pydantic 提供配置。
在Config类中，设置属性orm\_mode = True。

```python
class Item(ItemBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True
```

Pydantic`orm_mode`将告诉 Pydantic模型如何读取数据，即它不是一个`dict`，而是一个 ORM 模型（或任何其他具有属性的任意对象）。

# 9.路由

可以使用 `APIRouter` 为模块创建路由

```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/users/", tags=["users"])
async def read_users():
    return [{"username": "Rick"}, {"username": "Morty"}]


```

使用.include\_router()来导入路由

```python
app.include_router(
    admin.router,
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_token_header)],
    responses={418: {"description": "I'm a teapot"}},
)
# 导入了一个 有自定义 prefix、tags、responses 和 dependencies 的 APIRouter
```

自定义的字段可以在APIRouter()实例化的时候加入，也可以在由上一级app导入的时候加入，效果是一样的

[WebSocket推送消息给前端](https://www.wolai.com/uJfo4MCrJvaHRNwBWPzNtu "WebSocket推送消息给前端")
