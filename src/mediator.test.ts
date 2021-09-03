import { Mediator } from './mediator';

class UnitTestRequest {
  value: string;

  constructor({ value }: { value: string }) {
    this.value = value;
  }
}

describe('Mediator', () => {
  let mediator = new Mediator();

  beforeEach(() => {
    mediator = new Mediator();
  });

  describe('#on', () => {
    it('registers a handler that can then be invoked', async () => {
      const handler = jest.fn();
      const request = new UnitTestRequest({ value: 'hello' })

      mediator.on('UnitTestRequest', handler);
      await mediator.handle(request);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('#handle', () => {
    const expectedResult = 'expected';
    const handler = jest.fn(() => Promise.resolve(expectedResult));
    const request = new UnitTestRequest({ value: 'hello' })

    describe('when a handler is registered', () => {
      beforeEach(() => {
        mediator.on('UnitTestRequest', handler);
      });

      describe('#beforeEach', () => {
        it('executes all registered "before" callbacks, before the handler', async () => {
          const befores = [jest.fn(), jest.fn()];
          befores.forEach(before => mediator.beforeEach(before));

          await mediator.handle(request);
          befores.forEach(before => {
            expect(before).toHaveBeenCalledTimes(1);
            expect(before).toHaveBeenCalledWith(request);
            expect(before).toHaveBeenCalledBefore(handler);
          });
        });

        it('provides a callback to remove the "before" callback', async () => {
          const [removed, remaining] = [jest.fn(), jest.fn()];
          const { remove } = mediator.beforeEach(removed);
          mediator.beforeEach(remaining);

          remove();
          await mediator.handle(request);

          expect(removed).not.toHaveBeenCalled();
          expect(remaining).toHaveBeenCalled();
        });
      })

      describe('#afterEach', () => {
        it('executes all registered "after" callbacks, after the handler', async () => {
          const afters = [jest.fn(), jest.fn()];
          afters.forEach(after => mediator.afterEach(after));

          await mediator.handle(request);
          afters.forEach(after => {
            expect(after).toHaveBeenCalledTimes(1);
            expect(after).toHaveBeenCalledWith(request, expectedResult);
            expect(after).toHaveBeenCalledAfter(handler);
          });
        });

        it('provides a callback to remove the "after" callback', async () => {
          const [removed, remaining] = [jest.fn(), jest.fn()];
          const { remove } = mediator.afterEach(removed);
          mediator.afterEach(remaining);

          remove();
          await mediator.handle(request);

          expect(removed).not.toHaveBeenCalled();
          expect(remaining).toHaveBeenCalled();
        });
      })

      it('passes the request to the handler', async () => {
        await mediator.handle(request);
        expect(handler).toHaveBeenCalledWith(request);
      });

      it('executes the associated handler once', async () => {
        await mediator.handle(request);
        expect(handler).toHaveBeenCalledTimes(1);
      });

      it('returns the result from the handler', async () => {
        const result = await mediator.handle(request);
        expect(result).toEqual(expectedResult);
      });
    });

    describe('when no handler is registered', () => {
      it('does nothing', async () => {
        const result = await mediator.handle(request);
        expect(result).toBeUndefined();
      });
    })
  });
});
