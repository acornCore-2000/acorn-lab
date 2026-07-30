import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region:"default",
    endpoint: process.env.S3_ENDPOINT, 
    credentials:{
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey:process.env.S3_SECRET_KEY,
    },
    forcePathStyle:true,
});

export default s3;