Abstract class which is a base for every @adminjs/upload Adapter.

To implement your own - you have to override all of its methods.
Next, you can pass it with: {@link UploadOptions.provider UploadOptions.provider}

### Extending {@link BaseProvider}

The following example shows how you can extend {@link BaseProvider} and pass it to
{@link UploadOptions}:

```javascript
const { BaseProvider } = require('@adminjs/upload')

class MyProvider extends BaseProvider {
    constructor() {
      // you have to pass bucket name to the constructor
    super('bucketName')
  }

  public async upload() {
        console.log('uploaded')
      return true
    }

  public async delete() {
        console.log('deleted')
      return true
    }

  public async path() {
        return '/fle-url'
    }
  }

const options = {
    resources: [
      resource: YourResource,
    features: [uploadFeature({
        provider: new MyProvider(),
      properties: { ... },
    })],
  ]
}
```
