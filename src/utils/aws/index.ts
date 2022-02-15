import aws from "aws-sdk";
import { Request, Response } from "express";
import multer from "multer";
import multers3 from "multer-s3";
import { awsBucket, awsID, awsKey } from "../../config";
import logger from "../logger";
import formatLog from "../logger/formatLog";
import { successResponse } from "../responses";

const s3 = new aws.S3({
  secretAccessKey: awsKey,
  accessKeyId: awsID
});

const validFileTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "text/csv",
  "audio/mpeg",
  "audio/mp4",
  "audio/mp3",
  "audio/ogg",
  "audio/vnd.wav",
  "audio/wave",
  "video/mp4",
  "video/3gpp",
  "video/quicktime",
  "video/x-ms-wmv",
  "video/x-msvideo",
  "video/x-flv"
];

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (validFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, JPG files are allowed"));
  }
};

const upload = multer({
  fileFilter,
  limits: {
    parts: Infinity,
    fileSize: 1024 * 1024 * 250 //Maximum of 200Mb file size
  },
  storage: multers3({
    acl: "public-read",
    s3,
    bucket: awsBucket,
    contentType: multers3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req: Request, file, cb) {
      try {
        let key = `${Date.now()}-${file.originalname.toLowerCase()}`;

        //Create sub folders in S3 bucket
        if (file.fieldname == "profileImageUrl") {
          key = `profile-image/${key}`;
        }

        logger.info(
          formatLog(
            req,
            `Saving file ${file.originalname} as ${key} in AWS bucket`
          )
        );
        cb(null, key);
      } catch (err) {
        cb(new Error("An Error occured while uploading files"));
      }
    }
  })
});

export default upload;

export const deleteSingleFile = async (
  req: Request,
  filepath: string
): Promise<void> => {
  logger.info(formatLog(req, `Deleting file with key "${filepath}"`));

  const params = { Bucket: awsBucket, Key: filepath };

  await s3.deleteObject(params, (err) => {
    if (err) throw new Error(err.message);
    else logger.info(formatLog(req, `Deleted file with key "${filepath}"`));
  });
};

export const downloadSingleFile = async (
  req: Request,
  res: Response,
  filepath: string
): Promise<void> => {
  logger.info(formatLog(req, `Downloading file with key ${filepath}`));

  const options = {
    Bucket: awsBucket,
    Key: filepath
  };

  res.attachment(filepath);
  const fileStream = s3.getObject(options).createReadStream();
  fileStream.pipe(res);
  logger.info(
    formatLog(req, `Successfully downloaded the file with key ${filepath} `)
  );
};

export const deleteMultipleFiles = async (
  req: Request,
  filepaths: { Key: string }[]
): Promise<void> => {
  logger.info(
    formatLog(
      req,
      `Deleting files with filepaths "${JSON.stringify(filepaths)}"`
    )
  );

  const params = { Bucket: awsBucket, Delete: { Objects: filepaths } };

  await s3.deleteObjects(params, (err) => {
    if (err) throw new Error(err.message);
    else
      logger.info(
        formatLog(
          req,
          `Deleted files with filepaths "${JSON.stringify(filepaths)}`
        )
      );
  });
};
