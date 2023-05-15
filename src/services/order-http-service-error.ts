import { ZodError, ZodIssue } from 'zod';

export class OrderHttpServiceError extends Error {
	public issues: ZodIssue[] | undefined;

	constructor(message: string, cause?: ZodError) {
		super(message);
		this.issues = cause?.issues;
	}
}
