import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { UploadedFile } from "adminjs";
import { DAY_IN_MINUTES } from "../constants.js";
import { BaseProvider } from "./base-provider.js";

export type AzureOptions = {
  bucket: string; // Azure Storage Container name, where files will be stored
  expires?: number;
};

export class AzureProvider extends BaseProvider {
  protected containerClient: ContainerClient;
  public expires: number;

  constructor(options: AzureOptions) {
    super(options.bucket);
    this.expires = options.expires ?? DAY_IN_MINUTES;
    const blobServiceClient = new BlobServiceClient(options.bucket);
    this.containerClient = blobServiceClient.getContainerClient(options.bucket);
  }

  public async upload(file: UploadedFile, key: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(key);
    await blockBlobClient.upload(file.path, file.size);
  }

  public async delete(key: string, bucket: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(key);
    await blockBlobClient.delete();
  }

  public async path(key: string, bucket: string): Promise<string> {
    return `https://${bucket}.blob.core.windows.net/${key}`;
  }
}
