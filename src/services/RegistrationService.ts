import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { RegistrationEntity } from "../entities/RegistrationEntity";

interface TopRegistrations {
  isin: string;
  amount: number;
}

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

  public async topRegistrations(top: number): Promise<TopRegistrations[]> {
    const registrationCounts = await this.registrationRepository
      .createQueryBuilder("registration")
      .select("registration.isin, COUNT(registration.id) as registrationCount")
      .where("registration.isNotified = :isNotified", { isNotified: false })
      .groupBy("registration.isin")
      .orderBy("registrationCount", "DESC")
      .limit(top)
      .getRawMany();

    const topRegistrations: TopRegistrations[] = registrationCounts.map(
      (registration) => ({
        isin: registration.isin,
        amount: registration.registrationCount,
      })
    );

    topRegistrations.sort((a, b) => a.amount - b.amount);

    return topRegistrations;
  }

  public async markRegistrationAsNotified(
    registration: RegistrationEntity
  ): Promise<void> {
    await this.registrationRepository.save({
      ...registration,
      isNotified: true,
    });
    console.info("Registration updated");
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
