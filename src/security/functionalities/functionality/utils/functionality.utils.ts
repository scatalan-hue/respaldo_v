import { Repository } from 'typeorm';
import { I18N_SPACE } from '../../../../common/i18n/constants/spaces.constants';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { UpdateFunctionalityInput } from '../dto/inputs/update-functionality.input';
import { Functionality } from '../entities/functionality.entity';
import { FunctionalityService } from '../services/functionality.service';
import { FunctionalityModel } from '../types/functionality.type';

/**
 * Retrieves a description, falling back to a provided value if the i18n key matches the default fallback.
 *
 * @param {string} key The key of the functionality.
 * @param {string} descriptionI18n The i18n description.
 * @param {string} description The fallback description.
 *
 * @returns {string} The resolved description.
 */
export const getDescriptionOrFallback = (key: string, descriptionI18n: string, description: string): string => {
  const fallbackKey = `${I18N_SPACE.Functionality}.functionalityKeys.${key}.description`;
  return descriptionI18n === fallbackKey ? description : descriptionI18n;
};

/**
 * Retrieves a title, falling back to a provided value if the i18n key matches the default fallback.
 *
 * @param {string} key The key of the functionality.
 * @param {string} titleI18n The i18n title.
 * @param {string} title The fallback title.
 * @param {string} name The fallback name if the title is not available.
 *
 * @returns {string} The resolved title.
 */
export const getTitleOrFallback = (key: string, titleI18n: string, title: string, name: string): string => {
  const fallbackKey = `${I18N_SPACE.Functionality}.functionalityKeys.${key}.title`;
  return titleI18n === fallbackKey ? title || name : titleI18n;
};

/**
 * Synchronizes child functionalities by recursively processing them.
 *
 * @param {IContext} context The execution context.
 * @param {FunctionalityModel} keys The functionality model containing children.
 * @param {Functionality} functionality The parent functionality.
 * @param {FunctionalityService} functionalityService The service handling functionalities.
 *
 * @returns {Promise<void>} A promise that resolves when all children are synchronized.
 */
export const synchronizeChildrenFunctionalities = async (
  context: IContext,
  keys: FunctionalityModel,
  functionality: Functionality,
  functionalityService: FunctionalityService,
): Promise<void> => {
  for (let i = 0; i < keys.children.length; i++) {
    const child = keys.children[i];

    await functionalityService.synchronizeFunctionalities(context, child, functionality);
  }
};

/**
 * Creates or updates a functionality, handling parent relationships.
 *
 * @param {IContext} context The execution context.
 * @param {string} key The key of the functionality.
 * @param {Functionality} functionality The existing functionality, if any.
 * @param {Partial<Functionality>} newFunctionality The data for the new or updated functionality.
 * @param {Functionality} parent The parent functionality, if any.
 * @param {Repository<Functionality>} repository The repository to interact with the database.
 * @param {FunctionalityService} functionalityService The service handling functionalities.
 *
 * @returns {Promise<void>} A promise that resolves when the functionality is created or updated.
 */
export const createOrUpdateFunctionality = async (
  context: IContext,
  key: string,
  functionality: Functionality,
  newFunctionality: Partial<Functionality>,
  parent: Functionality,
  repository: Repository<Functionality>,
  functionalityService: FunctionalityService,
): Promise<void> => {
  if (!!functionality) {
    await functionalityService.update(
      context,
      functionality.id,
      {
        id: functionality.id,
        ...newFunctionality,
      } as UpdateFunctionalityInput,
      // false
    );

    const functionalityUpdated: Functionality = await functionalityService.findOneBy(context, { where: { key }, relations: ['parent'] });

    if (parent) {
      functionalityUpdated.parent = !!functionalityUpdated.parent ? [...(await functionalityUpdated.parent), parent] : [parent];

      await repository.save(functionalityUpdated);
    }
    return;
  }

  functionality = repository.create(newFunctionality);

  if (parent) functionality.parent = [parent];

  await repository.save(functionality);

  return;
};
