import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import { StackContext, SvelteKitSite,Bucket } from 'sst/constructs'

export function Website({ stack }: StackContext): void {
	const domainName = 'hufghani.dev'
	const bucketName = "hufghani.dev-open-graph-image-bucket"
	const hostedZone: route53.IHostedZone = route53.HostedZone.fromLookup(stack, 'HostedZone', {
		domainName,
	})

	const certificateArn: string = ssm.StringParameter.fromStringParameterName(
		stack,
		'certificateSSM',
		`/${domainName}/Certificate`
	).stringValue

	const site: SvelteKitSite = new SvelteKitSite(stack, 'Site', {
		edge: true,
		runtime: 'nodejs18.x',
		environment:{
			S3_BUCKET_NAME: bucketName
		},
		customDomain: {
			domainName,
			cdk: {
				hostedZone,
				certificate: Certificate.fromCertificateArn(stack, 'certificate', certificateArn),
			},
		},
	})
	stack.addOutputs({
		URL: site.customDomainUrl,
	})


	const bucket = new Bucket(stack,"hufghani-open-graph-image-bucket",{
		cdk:{
			bucket:{
				bucketName
			}
		}
	})

}
