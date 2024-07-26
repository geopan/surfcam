import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
const domainName = process.env.DOMAIN_NAME || 'example.com';
const appName = process.env.APP_NAME || 'app';


import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  public readonly publicBucket: s3.Bucket;
  public readonly zone: route53.IHostedZone;
  public readonly cName: route53.CnameRecord;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.publicBucket = new s3.Bucket(this, `${appName}-${domainName}-bucket`, {
      bucketName: `${appName}.${domainName}`,
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      websiteIndexDocument: 'index.html',
    });

    this.zone = route53.HostedZone.fromLookup(this, 'base-zone', {
      domainName: domainName
    });

    this.cName = new route53.CnameRecord(this, `${appName}-basezone`, {
      zone: this.zone,
      recordName: appName,
      domainName: this.publicBucket.bucketWebsiteDomainName
    });

    // Deploy static code/files into Bucket.
    const deployment = new s3Deployment.BucketDeployment(
      this,
      'deployStaticWebsite',
      {
        sources: [s3Deployment.Source.asset('./src')],
        destinationBucket: this.publicBucket,
      }
    );
  }
}
