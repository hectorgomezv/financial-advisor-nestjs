import { Maths } from '../../../common/domain/entities/maths.entity';
import { CompanyMetrics as DomainCompanyMetrics } from '../../domain/entities/company-metrics.entity';
import { CompanyState as DomainCompanyState } from '../../domain/entities/company-state.entity';
import {
  CompanyWithState as DomainCompanyWithState,
  CompanyWithStateAndMetrics as DomainCompanyWithStateAndMetrics,
} from '../../domain/entities/company.entity';
import { CompanyMetrics } from '../entities/company-metrics.entity';
import { CompanyState } from '../entities/company-state.entity';
import {
  CompanyWithState,
  CompanyWithStateAndMetrics,
} from '../entities/company.entity';

export class CompanyRouteMapper {
  public static mapCompanyWithState(
    company: DomainCompanyWithState,
  ): CompanyWithState {
    return {
      ...company,
      state: this.mapCompanyState(company.state),
    };
  }

  public static mapCompanyState(
    companyState: DomainCompanyState | null,
  ): CompanyState | null {
    if (companyState === null) {
      return null;
    }
    return {
      id: companyState.id,
      companyId: companyState.companyId,
      currency: companyState.currency,
      enterpriseToEbitda: Maths.round(companyState.enterpriseToEbitda),
      enterpriseToRevenue: Maths.round(companyState.enterpriseToRevenue),
      forwardPE: Maths.round(companyState.forwardPE),
      price: Maths.round(companyState.price),
      profitMargins: Maths.round(companyState.profitMargins),
      shortPercentOfFloat: Maths.round(companyState.shortPercentOfFloat),
      timestamp: companyState.timestamp,
    };
  }

  public static mapCompanyWithStateAndMetrics(
    company: DomainCompanyWithStateAndMetrics,
  ): CompanyWithStateAndMetrics {
    return {
      ...company,
      state: this.mapCompanyState(company.state),
      metrics: this.mapCompanyMetrics(company.metrics),
    };
  }

  public static mapCompanyMetrics(
    companyMetrics: DomainCompanyMetrics | null,
  ): CompanyMetrics | null {
    if (companyMetrics === null) {
      return null;
    }
    return {
      avgEnterpriseToRevenue: Maths.round(
        companyMetrics.avgEnterpriseToRevenue,
      ),
      avgEnterpriseToEbitda: Maths.round(companyMetrics.avgEnterpriseToEbitda),
      avgForwardPE: Maths.round(companyMetrics.avgForwardPE),
      avgProfitMargins: Maths.round(companyMetrics.avgProfitMargins),
    };
  }
}
