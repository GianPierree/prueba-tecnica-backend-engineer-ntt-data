export class EventCounterUtil {
  private static instance: EventCounterUtil;
  private counter = 0;

  private constructor() {}

  static getInstance(): EventCounterUtil {
    if (!EventCounterUtil.instance) {
      EventCounterUtil.instance = new EventCounterUtil();
    }
    return EventCounterUtil.instance;
  }

  next(): number {
    return ++this.counter;
  }
}