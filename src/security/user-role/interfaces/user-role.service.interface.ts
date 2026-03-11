import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { ReplaceAllUserRolesInput } from '../dto/inputs/replace-all-user-roles';
import { UserRole } from '../entities/user-role.entity';

export interface UserRolesServiceInterface {
  /**
   * Creates and assigns roles to a specific user.
   *
   * This method verifies if the roles are already assigned to the user. If not,
   * it creates and associates the roles with the specified user.
   *
   * @param {IContext} context - The execution context containing request-related information.
   * @param {string} userId - The unique identifier of the user to whom the roles will be assigned.
   * @param {string[]} roleIds - An array containing the unique identifiers of the roles to assign.
   *
   * @returns {Promise<UserRole[]>} - A promise that resolves to an array of `UserRole` objects that were created and assigned.
   *
   * @throws {BadRequestException} - Throws an exception if the role is invalid or cannot be assigned.
   * @throws {Error} - Throws a generic exception if an error occurs during creation or assignment.
   *
   * @example
   * // Example usage:
   * const context = { user: 'admin' };
   * const userId = 'user-123';
   * const roleIds = ['role-1', 'role-2'];
   *
   * try {
   *   const result = await createUserRoles(context, userId, roleIds);
   *   console.log('Roles assigned:', result);
   * } catch (error) {
   *   console.error('Error assigning roles:', error.message);
   * }
   */
  createUserRoles: (context: IContext, userId: string, roleIds: string[]) => Promise<UserRole[]>;

  /**
   * Replaces all roles assigned to a specific user.
   *
   * This method removes all current roles associated with the user and assigns the new set of roles
   * provided in the input. If no new roles are specified, it simply clears the user's roles.
   *
   * @param {IContext} context - The execution context containing request-related information.
   * @param {ReplaceAllUserRolesInput} replaceAllUserRolesInput - An object containing the user ID and the new role IDs to assign.
   * @property {string} userId - The unique identifier of the user whose roles will be replaced.
   * @property {string[]} roleIds - An array of role IDs to assign to the user. If empty, all roles will be removed.
   *
   * @returns {Promise<UserRole[]>} - A promise that resolves to an array of `UserRole` objects that were newly created and assigned.
   *
   * @throws {BadRequestException} - Throws an exception if an error occurs during the removal or creation process.
   * @throws {Error} - Throws a generic exception for unexpected errors.
   *
   * @example
   * // Example usage:
   * const context = { user: 'admin' };
   * const input = {
   *   userId: 'user-123',
   *   roleIds: ['role-1', 'role-2']
   * };
   *
   * try {
   *   const updatedRoles = await replaceAllUserRoles(context, input);
   *   console.log('New roles assigned:', updatedRoles);
   * } catch (error) {
   *   console.error('Error replacing user roles:', error.message);
   * }
   */
  replaceAllUserRoles(context: IContext, replaceAllUserRolesInput: ReplaceAllUserRolesInput): Promise<UserRole[]>;
}
