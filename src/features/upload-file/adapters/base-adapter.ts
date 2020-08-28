/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
export default class BaseAdapter {
  public async upload(tmpFile: Buffer, key: string): Promise<any> {
    throw new Error('You have to implement upload method')
  }

  public async delete(key: string, bucket: string): Promise<any> {
    throw new Error('You have to implement delete method')
  }

  public async path(key: string, bucket: string): Promise<any> {
    throw new Error('You have to implement path method')
  }
}
