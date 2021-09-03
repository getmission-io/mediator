import { handle } from './handle';
import { Mediator } from './mediator';

class UnitTestRequest {}

describe('@handle (decorator)', () => {
  const mediator = new Mediator();
  const decorate = handle({ mediator, request: UnitTestRequest });

  it('should register the handler with the mediator', () => {
    const handle = jest.fn();
    const on = jest.spyOn(mediator, 'on');

    decorate({ handle });

    expect(on).toHaveBeenCalledWith('UnitTestRequest', handle);
  });
});
