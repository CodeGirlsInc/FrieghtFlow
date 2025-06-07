import { Injectable } from "@nestjs/common"
import { HealthIndicator, type HealthIndicatorResult, HealthCheckError } from "@nestjs/terminus"
import { promisify } from "util"
import { exec } from "child_process"
import * as fs from "fs"

const execAsync = promisify(exec)

@Injectable()
export class DiskHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const diskInfo = await this.getDiskUsage()
      const uploadDirInfo = await this.getUploadDirectoryInfo()

      const diskData = {
        root: diskInfo,
        uploads: uploadDirInfo,
        thresholds: {
          warning: "80%",
          critical: "90%",
        },
      }

      // Check if disk usage is within acceptable limits
      const isHealthy = diskInfo.usagePercent < 90

      if (!isHealthy) {
        throw new HealthCheckError("Disk usage too high", this.getStatus(key, false, diskData))
      }

      return this.getStatus(key, isHealthy, diskData)
    } catch (error) {
      const result = this.getStatus(key, false, {
        error: error.message,
      })

      throw new HealthCheckError("Disk health check failed", result)
    }
  }

  private async getDiskUsage() {
    try {
      // Try to get disk usage using df command (Unix/Linux/macOS)
      const { stdout } = await execAsync("df -h / | tail -1")
      const parts = stdout.trim().split(/\s+/)

      return {
        filesystem: parts[0],
        size: parts[1],
        used: parts[2],
        available: parts[3],
        usagePercent: Number.parseInt(parts[4].replace("%", "")),
        mountPoint: parts[5],
      }
    } catch (error) {
      // Fallback for Windows or if df command fails
      return {
        filesystem: "unknown",
        size: "unknown",
        used: "unknown",
        available: "unknown",
        usagePercent: 0,
        mountPoint: "/",
        error: "Could not determine disk usage",
      }
    }
  }

  private async getUploadDirectoryInfo() {
    const uploadPath = process.env.UPLOAD_PATH || "./uploads"

    try {
      const stats = await fs.promises.stat(uploadPath)
      const files = await fs.promises.readdir(uploadPath, { recursive: true })

      // Calculate total size of upload directory
      let totalSize = 0
      for (const file of files) {
        try {
          const filePath = `${uploadPath}/${file}`
          const fileStats = await fs.promises.stat(filePath)
          if (fileStats.isFile()) {
            totalSize += fileStats.size
          }
        } catch (error) {
          // Skip files that can't be accessed
        }
      }

      return {
        path: uploadPath,
        exists: true,
        totalFiles: files.length,
        totalSize: this.formatBytes(totalSize),
        totalSizeBytes: totalSize,
        lastModified: stats.mtime.toISOString(),
      }
    } catch (error) {
      return {
        path: uploadPath,
        exists: false,
        error: error.message,
      }
    }
  }

  private formatBytes(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }
}
