import { Mock, IMock, Times, It } from 'typemoq';
import { BaseEventDispatcher } from '../../../src/JSTestHost/Events/IEventDispatcher';
import { IEventArgs, IEventHandler } from '../../../src/JSTestHost/ObjectModel/Common';
import { Event } from '../../../src/JSTestHost/Events/Event';
import * as Assert from 'assert';

describe('Event Suite', () => {
    let mockEventDispatcher: IMock<BaseEventDispatcher>;

    before(() => {
        mockEventDispatcher = Mock.ofType(TestableEventDispatcher);
    });

    it('Event constructor will call eventDispatcher.register', (done: any) => {
        const event = new Event<IEventArgs>(mockEventDispatcher.object);
        mockEventDispatcher.verify((x) => x.registerEvent(), Times.once());
        done();
    });

    it('Event will call eventDispatchers subscribe unsubscribe and raise.', (done: any) => {
        mockEventDispatcher.reset();
        
        mockEventDispatcher.setup((x) => x.registerEvent()).returns(() => {
            return 'eventid';
        });

        const event = new Event<IEventArgs>(mockEventDispatcher.object);
        const dummyHandler = (sender: Object, args: IEventArgs) => { return 'dummy handler'; };
        const dummyArgs = <IEventArgs>{
            arg: 'some arg'
        };
        const dummyObject = {
            property: 'dummy'
        };

        event.subscribe(dummyHandler);
        event.raise(dummyObject, dummyArgs);
        event.unsubscribe(dummyHandler);

        mockEventDispatcher.verify((x) => x.subscribe(It.isValue('eventid'),
                                                      It.is((x) => x.toString() === dummyHandler.toString())),
                                                      Times.once());
        mockEventDispatcher.verify((x) => x.raise(It.isValue('eventid'),
                                                  It.is((x) => JSON.stringify(x) === JSON.stringify(dummyObject)),
                                                  It.is((x) => x.toString() === dummyArgs.toString())),
                                                  Times.once());

        done();
    });

    it('EventDispatcher will create unique event ids', (done: any) => {
        const eventidMap = new Map<string, number>();
        const eventDispatcher = new TestableEventDispatcher();
        
        for (let i = 0; i < 1000; i++) {
            const id = eventDispatcher.registerEvent();
            eventidMap.set(id, 1);
            Assert.notEqual(eventDispatcher.registerEvent().match(/[0-9]+/), null);
        }

        Assert.equal(1000, eventidMap.size);
        done();
    });
});

class TestableEventDispatcher extends BaseEventDispatcher {
    public subscribe(eventId: string, callback: IEventHandler<IEventArgs>) {
        return;
    }
    public unsubscribe(eventId: string, callback: IEventHandler<IEventArgs>) {
        return;
    }
    public raise(eventId: string, sender: object, args: IEventArgs) {
        return;
    }
}