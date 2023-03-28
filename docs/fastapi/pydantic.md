# pydantic

使用Python类型注释的数据验证和设置管理。 &#x20;

pydantic在运行时执行类型提示，并在数据无效时提供用户友好的错误。 &#x20;

定义数据应该如何在纯粹的、规范的Python中出现；用pydantic来验证它。

```python
from pydantic import BaseModel
from datetime import datetime
from typing import List,Optinal

class User(BaseModel):
  id:int  # 必填字段
  name:str = "Creat"  # 设置默认值，有默认值即为选填字段
  age:Optinal[int]    # 也可以用optinal定义为选填字段，更易阅读
  friends:List[str]   # 嵌套定义类型
  created_time:datetime # 时间类型
  
 data = {
 id:"12",  # 传入str也会被转化为int，前提是可转换
 # name 不填将会用默认值
 "age":11,
 "friends":["dd","aa"]
 # created_time  不填会抛出异常
 }
 
 # 赋值的方式有多种 
 user = User(**data) # 直接解包
 user = User.parse_obj(obj=data) # 调用类方法
 user = User.parse_raw('{"id":12,"age":11}') # 解析json字符串
 user = User.parse_file('xxx.json') # 解析json文件

```

pydantic 泛型

<https://docs.pydantic.dev/usage/models/#generic-models>
