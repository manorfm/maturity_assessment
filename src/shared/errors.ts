export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    public readonly safeMessage: string,
  ) {
    super(safeMessage);
    this.name = new.target.name;
  }
}

export class DomainValidationError extends AppError {
  constructor(message = 'Não foi possível validar os dados informados.') {
    super('VALIDATION_ERROR', 422, message);
  }
}

export class ResourceNotFoundError extends AppError {
  constructor(message = 'O recurso solicitado não foi encontrado.') {
    super('NOT_FOUND', 404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', 409, message);
  }
}
