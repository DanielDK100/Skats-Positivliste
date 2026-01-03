import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistrationEntity } from '../entities/registration.entity';
import { TopRegistrationDto } from '../dtos/registration.dto';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(RegistrationEntity)
    private registrationRepository: Repository<RegistrationEntity>,
  ) {}

  public async fetchUnnotifiedRegistrations(
    isin: string,
  ): Promise<RegistrationEntity[]> {
    return await this.registrationRepository.find({
      where: {
        isin: isin,
        isNotified: false,
      },
    });
  }

  public async topRegistrations(top: number): Promise<TopRegistrationDto[]> {
    const registrationCounts = await this.registrationRepository
      .createQueryBuilder('registration')
      .select('registration.isin, COUNT(registration.id) as registrationCount')
      .where('registration.isNotified = :isNotified', { isNotified: false })
      .groupBy('registration.isin')
      .orderBy('registrationCount', 'DESC')
      .limit(top)
      .getRawMany();

    const topRegistrations: TopRegistrationDto[] = registrationCounts.map(
      (registration) => ({
        isin: registration.isin,
        amount: registration.registrationCount,
      }),
    );

    topRegistrations.sort((a, b) => a.amount - b.amount);

    return topRegistrations;
  }

  public async markRegistrationAsNotified(
    registration: RegistrationEntity,
  ): Promise<void> {
    await this.registrationRepository.save({
      ...registration,
      isNotified: true,
    });
    console.info('Registration updated');
  }

  public async resetIsNotified(
    registration: RegistrationEntity,
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
