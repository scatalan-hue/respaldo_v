import { IContext } from "../../../../patterns/crud-pattern/interfaces/context.interface";
import { FunctionalitiesByRoleEventInput } from "../dto/events/functionalities-by-role.event";
import { FunctionalityDescriptionInput } from "../dto/inputs/functionality-description.input";
import { Functionality } from "../entities/functionality.entity";
import { FunctionalityModel } from "../types/functionality.type";

export interface FunctionalityServiceInterface {
  /**
   * Retrieves the description of a functionality by its key.
   *
   * @param {IContext} context The execution context.
   * @param {FunctionalityDescriptionInput} input The input containing the functionality key.
   *
   * @returns {Promise<Functionality>} A promise that resolves to the found functionality.
   * @throws {NotFoundException} If the functionality with the specified key is not found.
   */
  functionalitiesDescriptionByPermission(context: IContext, input: FunctionalityDescriptionInput): Promise<Functionality>;

  /**
   * Synchronizes functionalities, creating or updating them as needed.
   *
   * @param {IContext} context The execution context.
   * @param {FunctionalityModel} [child] The child functionality to synchronize.
   * @param {Functionality} [parent] The parent functionality, if any.
   *
   * @returns {Promise<string>} A promise that resolves to a success message.
   */
  synchronizeFunctionalities(context: IContext, child?: FunctionalityModel, parent?: Functionality): Promise<string>;

  /**
   * Retrieves all functionalities.
   *
   * @param {IContext} context The execution context.
   *
   * @returns {Promise<Functionality>} A promise that resolves to the root functionality with all children loaded.
   */
  findAllFunctionalities(context: IContext): Promise<Functionality>;

  /**
   * Retrieves functionalities associated with a specific role.
   *
   * @param {FunctionalitiesByRoleEventInput} input The input containing the context and role information.
   *
   * @returns {Promise<Functionality[]>} A promise that resolves to an array of functionalities for the specified role.
   */
  functionalitiesByRole({ context, role }: FunctionalitiesByRoleEventInput): Promise<Functionality[]>;
}
