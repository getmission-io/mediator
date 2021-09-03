import _default from './mediator';
import type { Mediator } from './mediator';

interface HandleOptions {
  request: Function;
  mediator?: Mediator;
}

interface Handler {
  handle: (request: any) => Promise<any>
}

export function handle({ request, mediator = _default }: HandleOptions) {
  return function (target: Handler) {
    mediator.on(request.name, target.handle);
  }
}
