import { ActionContext, UploadedFile } from 'adminjs'
import { ERROR_MESSAGES } from '../constants.js'
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable class-methods-use-this */

export type ProviderOpts = {
  baseUrl?: string; // path prefix for local provider
};

/**
 * @load ./base-provider.doc.md
 * @memberof module:@adminjs/upload
 * @alias BaseProvider
 * @hide
 * @private
 */
abstract class BaseProvider {
  /**
   * Name is used to verify if the object passed by {@link UploadOptions#provider} is
   * this type. We cannot check typeof because there could be a different versions of
   * npm package installed in a project.
   */
  public name: string

  /**
   * Bucket is a place where files should be stored. Usually it is a folder location
   */
  public bucket: string

  /**
   * Provider extra options
   */
  public opts?: ProviderOpts

  /**
   * @param { string } bucket     place where files should be stored
   */
  constructor(bucket: string, opts?: ProviderOpts) {
    this.name = 'BaseProvider'
    this.bucket = bucket
    this.opts = opts || {}
  }

  /**
   * Uploads file to given bucket
   *
   * @param {UploadedFile} file uploaded by AdminJS file
   * @param {string} key file path
   * @param {ActionContext} context
   * @abstract
   */
  public async upload(
    file: UploadedFile,
    key: string,
    context: ActionContext,
  ): Promise<any> {
    throw new Error(
      ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED('BaseProvider#upload'),
    )
  }

  /**
   * Deletes given file
   *
   * @param {string} key file path
   * @param {string} bucket where file should be uploaded
   * @param {ActionContext} context
   * @abstract
   */
  public async delete(
    key: string,
    bucket: string,
    context: ActionContext,
  ): Promise<any> {
    throw new Error(
      ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED('BaseProvider#delete'),
    )
  }

  /**
   * Returns path for the file from where it can be downloaded. It is dynamic in case of
   * time based paths: i.e. link valid in the next 24h
   *
   * @param {string} key file path
   * @param {string} bucket where file should be put
   * @param {ActionContext} context
   * @async
   * @abstract
   */
  public path(
    key: string,
    bucket: string,
    context: ActionContext,
  ): Promise<string> | string {
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED('BaseProvider#path'))
  }
}

export { BaseProvider }
