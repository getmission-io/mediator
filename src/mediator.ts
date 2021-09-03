type Handler<TRequest, TResponse> = (request: TRequest) => Promise<TResponse>;
type BeforeHandler<TRequest> = (request: TRequest) => Promise<void>;
type AfterHandler<TRequest, TResult> = (
  request: TRequest,
  result: TResult
) => Promise<void>;

class Mediator {
  handlers = new Map<string, Handler<unknown, unknown>>();
  befores: BeforeHandler<unknown>[] = [];
  afters: AfterHandler<unknown, unknown>[] = [];

  private async runBeforeHandlers<TRequest>(request: TRequest) {
    return Promise.allSettled(this.befores.map((before) => before(request)));
  }

  private async runAfterHandlers<TRequest>(request: TRequest, result: unknown) {
    return Promise.allSettled(
      this.afters.map((after) => after(request, result))
    );
  }

  beforeEach(handler: BeforeHandler<unknown>) {
    const index = this.befores.push(handler) - 1;
    return { remove: () => this.befores.splice(index, 1) };
  }

  afterEach(handler: BeforeHandler<unknown>) {
    const index = this.afters.push(handler) - 1;
    return { remove: () => this.afters.splice(index, 1) };
  }

  on(type: string, handler: Handler<unknown, unknown>) {
    this.handlers.set(type, handler);
  }

  async handle<TRequest extends Object>(request: TRequest) {
    const handler = this.handlers.get(request.constructor.name);

    if (!handler) {
      return;
    }

    let result: unknown;
    await this.runBeforeHandlers(request);
    try {
      result = await handler(request);
      return result;
    } finally {
      await this.runAfterHandlers(request, result);
    }
  }
}

export { Mediator };

const instance = new Mediator();
export default instance;
