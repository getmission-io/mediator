import mediator from './mediator';
import { handle } from './handle';

class SayHelloRequest {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
};

@handle({ request: SayHelloRequest })
class SayHelloHandler {
  static handle(request: SayHelloRequest): Promise<string> {
    return Promise.resolve(`Hello ${request.name}`);
  }
}

describe('integration tests', () => {
  it('executes the handler registered by a decorator', async () => {
    const result = await mediator.handle(new SayHelloRequest('Tom'));
    expect(result).toStrictEqual('Hello Tom');
  });
});
