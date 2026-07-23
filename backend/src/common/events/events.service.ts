import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export interface DataChangedEvent {
  type: 'tasks' | 'todos';
  userId: number;
}

@Injectable()
export class EventsService {
  private readonly subject = new Subject<MessageEvent>();

  emit(event: DataChangedEvent) {
    this.subject.next({ data: event } as MessageEvent);
  }

  stream(userId: number) {
    return new Observable<MessageEvent>((subscriber) => {
      const subscription = this.subject.subscribe((msg) => {
        const data = msg.data as DataChangedEvent;
        if (data.userId === userId) {
          subscriber.next(msg);
        }
      });
      return () => subscription.unsubscribe();
    });
  }
}
