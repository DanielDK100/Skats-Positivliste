import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { RegistrationEntity } from "../entities/RegistrationEntity";

class RegistrationService {
  private registrationRepository: Repository<RegistrationEntity> =
    AppDataSource.getRepository(RegistrationEntity);

  public async fetchUnnotifiedRegistrations(
    isin: string
  ): Promise<RegistrationEntity[]> {
    return await this.registrationRepository.find({
      where: {
        isin: isin,
        isNotified: false,
      },
    });
  }

  public async markRegistrationAsNotified(
    registration: RegistrationEntity
  ): Promise<void> {
    await this.registrationRepository.save({
      ...registration,
      isNotified: true,
    });
  }

  public async resetIsNotified(
    registration: RegistrationEntity
  ): Promise<void> {
    const registrationToUpdate = await this.registrationRepository.findOne({
      where: {
        isin: registration.isin,
        email: registration.email,
      },
    });

    if (registrationToUpdate) {
      await this.registrationRepository.save({
        ...registrationToUpdate,
        isNotified: false,
      });
    } else {
      await this.registrationRepository.save({
        isin: registration.isin,
        email: registration.email,
      });
    }
  }
}

export default new RegistrationService();
