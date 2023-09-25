import { ListBucketsCommand, PutObjectCommand, S3 } from "@aws-sdk/client-s3";

const missinsEnv = [
  "SPACES_KEY",
  "SPACES_SECRET",
  "SPACES_ORIGIN",
  "SPACES_REGION",
].filter((key) => !import.meta.env[key]);

if (missinsEnv.length) {
  throw new Error(`Missing env variables: ${missinsEnv.join(", ")}`);
}

export const Bucket = "craftex";

export const s3Client = new S3({
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  endpoint: import.meta.env.SPACES_ORIGIN,
  region: import.meta.env.SPACES_REGION,
  credentials: {
    accessKeyId: import.meta.env.SPACES_KEY,
    secretAccessKey: import.meta.env.SPACES_SECRET,
  },
});

export default s3Client;