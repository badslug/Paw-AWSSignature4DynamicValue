# NOTE: Broken Official Paw Extension

As the offical version is currently broken in version `1.0.5` we forked this repository and made adjustments to get it running again.
Using this fork in Paw locally is currently not easily archiveable. So if you by accident updated you Paw Extension you can apply this patch to get it working again.

To adjust the extension locally you need to update the following file:

```shell
$(HOME)/Library/Containers/com.luckymarmot.Paw/Data/Library/Application Support/com.luckymarmot.Paw/Extensions/com.shigeoka.PawExtensions.AWSSignature4DynamicValue/AWSSignature4DynamicValue.js
```

The necessary changes are part of this PR against the upstream: https://github.com/badslug/Paw-AWSSignature4DynamicValue/pull/11

To update the file or to install the extension if not done yet you can run this taks in the console:

```shell
make install
```

---

# AWS Signature 4 Auth Dynamic Value (Paw Extension)

A [Paw Extension](http://luckymarmot.com/paw/extensions/) to compute
AWS Signature version 4 authentication signatures for the accessing the
main AWS services including REST APIs build using AWS API Gateway that are
protected using IAM.

## Installation

TBD

To support AWS Signature 4 authentication please follow these steps:

* Install this extension. For now, you should install by using the Makefile
    (see Development section below).
* Add a header `Authorization` and set the value to this extension (start
    typing "AWS" and select AWS Signature 4).
* Enter your credentials by clicking on the dynamic value extension.
    The AWS Access and Secret keys are required. If you
    leave the other fields blank they will use defaults.
* Add a second header `X-Amz-Date`. Set the value to custom timestamp (start
    typing "timestamp" and select any of the timestamp options).
* Enter a custom timestamp format by clicking on the dynamic value extension,
    and selecting `Custom formatting` from the format. Enter the value
    `%G%m%dT%H%M%SZ` for the format. Make sure `Now` is checked, delta is 0,
    and `local time` is unchecked. AWS requires the time be within a few seconds
    of server time in UTC (not local time).

If you don't have something to test against, follow the [Getting Started][start]
guide for the API Gateway service to create a basic "hello world" API. Make sure
that the API is [protected by IAM security][protect] by choosing "authorization type"
of `AWS IAM` in the console when configuring the method.

This extension is being developed primarily to test in-house API Gateway REST
APIs. However, AWS Signature 4 is used to protect all of the standard AWS
service endpoints. By ensuring you have the correct `aws service` setting
for the extension you can manually call any of the AWS service endpoints using
Paw.

[start]: http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html
[protect]: http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-method-settings-callers-console.html

# Issues

* Freeze dynamic values to obtain X-Amz-Date as generated and sent to client
* Need binary version of HMAC SHA256 crypto function. Currently using CryptJS
  which is fairly slow.

## Development

Edit source javascript file and run the following to install in Paw.

```shell
make install
```

## License

This Paw Extension is released under the [MIT License](LICENSE). Feel free to fork, and modify!

## Contributors

See [Contributors](https://github.com/luckymarmot/Paw-AWSSignature4DynamicValue/graphs/contributors).
