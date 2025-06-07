import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { User } from "../../user/entities/user.entity"
import type { AnalyticsEvent } from "../entities/analytics-event.entity"
import type { DateRangeDto, UserEngagementDto } from "../dto/analytics.dto"

@Injectable()
export class UserAnalyticsService {
  constructor(
    private readonly userRepository: Repository<User>,
    private readonly analyticsEventRepository: Repository<AnalyticsEvent>,
  ) {}

  async getUserEngagement(dateRange: DateRangeDto): Promise<UserEngagementDto[]> {
    const query = `
      WITH daily_stats AS (
        SELECT 
          DATE(ae.created_at) as date,
          COUNT(DISTINCT ae.user_id) as active_users,
          COUNT(CASE WHEN ae.event_type = 'page_view' THEN 1 END) as page_views,
          AVG(
            CASE WHEN ae.event_type = 'user_login' 
            THEN EXTRACT(EPOCH FROM (ae.metadata->>'session_end')::timestamp - ae.created_at)/60 
            END
          ) as avg_session_duration
        FROM analytics_events ae
        WHERE ae.created_at BETWEEN $1 AND $2
          AND ae.user_id IS NOT NULL
        GROUP BY DATE(ae.created_at)
      ),
      new_users AS (
        SELECT 
          DATE(u.created_at) as date,
          COUNT(*) as new_users
        FROM users u
        WHERE u.created_at BETWEEN $1 AND $2
        GROUP BY DATE(u.created_at)
      )
      SELECT 
        ds.date,
        COALESCE(ds.active_users, 0) as active_users,
        COALESCE(nu.new_users, 0) as new_users,
        COALESCE(ds.active_users - nu.new_users, 0) as returning_users,
        COALESCE(ds.avg_session_duration, 0) as avg_session_duration,
        COALESCE(ds.page_views, 0) as page_views
      FROM daily_stats ds
      LEFT JOIN new_users nu ON ds.date = nu.date
      ORDER BY ds.date ASC
    `

    const results = await this.analyticsEventRepository.query(query, [dateRange.startDate, dateRange.endDate])

    return results.map((row: any) => ({
      date: row.date,
      activeUsers: Number.parseInt(row.active_users),
      newUsers: Number.parseInt(row.new_users),
      returningUsers: Number.parseInt(row.returning_users),
      avgSessionDuration: Number.parseFloat(row.avg_session_duration),
      pageViews: Number.parseInt(row.page_views),
    }))
  }

  async getMonthlyActiveUsers(dateRange: DateRangeDto) {
    const query = `
      SELECT 
        DATE_TRUNC('month', ae.created_at) as month,
        COUNT(DISTINCT ae.user_id) as active_users
      FROM analytics_events ae
      WHERE ae.created_at BETWEEN $1 AND $2
        AND ae.user_id IS NOT NULL
        AND ae.event_type IN ('user_login', 'page_view', 'shipment_created')
      GROUP BY DATE_TRUNC('month', ae.created_at)
      ORDER BY month ASC
    `

    return this.analyticsEventRepository.query(query, [dateRange.startDate, dateRange.endDate])
  }

  async getTotalUsers(): Promise<number> {
    return this.userRepository.count()
  }

  async getActiveUsersCount(): Promise<number> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const result = await this.analyticsEventRepository.query(
      `
      SELECT COUNT(DISTINCT user_id) as active_users
      FROM analytics_events
      WHERE created_at >= $1 AND user_id IS NOT NULL
    `,
      [thirtyDaysAgo],
    )

    return Number.parseInt(result[0]?.active_users || 0)
  }
}
