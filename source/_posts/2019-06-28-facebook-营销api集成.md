---
title: facebook 营销api集成
date: 2019-06-28 10:15:25
tags: facebook
---

# facebook 营销api集成

营销api需要通过后端服务器与facebook服务器交互

### 1、下载营销api java代码

git clone https://github.com/facebook/facebook-java-business-sdk.git

编辑器：IDEA

```
// 在pom.xml中添加依赖
<dependency>
      <groupId>com.facebook.business.sdk</groupId>
      <artifactId>facebook-java-business-sdk</artifactId>
      <version>3.0.0</version>
</dependency>

插件maven-source-plugin 无法下载因缺失版本号
添加<version>3.1.0</version>
// 解决idea报错
在<build></build>标签内添加<defaultGoal>compile</defaultGoal>
在<plugins></plugins>标签外套一个标签<pluginManagement></pluginManagement>

```

添加java文件
```

import com.facebook.ads.sdk.APIContext;
import com.facebook.ads.sdk.AdAccount;
import com.facebook.ads.sdk.Campaign;
import com.facebook.ads.sdk.APIException;

public class QuickStartExample {

    public static final String ACCESS_TOKEN = "[Your access token]";//Your access token
    public static final Long ACCOUNT_ID = 123456789L; //Your account ID
    public static final String APP_SECRET = "[Your app secret]";//Your app secret

    public static final APIContext context = new APIContext(ACCESS_TOKEN, APP_SECRET);
    public static void main(String[] args) {
        try {
            System.out.println("==========");
            AdAccount account = new AdAccount(ACCOUNT_ID, context);

            Campaign campaign = account.createCampaign()
                    .setName("Java SDK Test Campaign")
                    .setObjective(Campaign.EnumObjective.VALUE_LINK_CLICKS)
                    .setSpendCap(10000L)
                    .setStatus(Campaign.EnumStatus.VALUE_PAUSED)
                    .execute();
            System.out.println(campaign.fetch());
        } catch (APIException e) {
            e.printStackTrace();
        }
    }
}

```

or

```

import com.facebook.ads.sdk.APIContext;
import com.facebook.ads.sdk.APINodeList;
import com.facebook.ads.sdk.AdAccount;
import com.facebook.ads.sdk.Campaign;

public class TestFBJavaSDK
{
    public static final APIContext context = new APIContext(
            "your-access-token",
            "your-appsecret"
    );
    public static void main(String[] args)
    {
        AdAccount account = new AdAccount("act_{your-adaccount-id}", context);
        try {
            APINodeList<Campaign> campaigns = account.getCampaigns().requestAllFields().execute();
            for(Campaign campaign : campaigns) {
                System.out.println(campaign.getFieldName());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }}


```


执行java文件既可发布请求到facebook服务器，
*** 需要安全上网 ***


## 1、主页推广
根据提示一步一步提交，到 沙盒账号，如果之前没有添加则新建，要推广的主页，如果无则新建

到下载示例代码，点下载，将会获得一个java文件，里面含有accessToken、appid、ad_account_id、app_secret等信息，
将该下载的SAMPLE_CODE.java文件放于与上面两个java文件同级目录，直接运行该java文件即可，
注意此时电脑需要科学上网，不然会报错***Timeout***



