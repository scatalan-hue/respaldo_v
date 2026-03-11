import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { FunctionalityService } from "../services/functionality.service";
import { functionalitiesByRoleEvent } from "../constants/events.constants";
import { FunctionalitiesByRoleEventInput } from "../dto/events/functionalities-by-role.event";
import { Functionality } from "../entities/functionality.entity";

@Injectable()
export class FunctionalityServiceEventHandler extends FunctionalityService {
  @OnEvent(functionalitiesByRoleEvent)
  async onFunctionalitiesByRole({ context, role }: FunctionalitiesByRoleEventInput): Promise<Functionality[]> {
    return await this.functionalitiesByRole({ context, role });
  }
}
