import { registerEnumType } from '@nestjs/graphql';

export enum ScheduleType {
  NOTIFY_MOVEMENTS = 'NOTIFY_MOVEMENTS',
  JOB_DUMMY = 'JOB_DUMMY',
}

registerEnumType(ScheduleType, {
  name: 'ScheduleType',
});
