import * as fs from "fs";
import * as path from "path";

/**
 * Centralized Storage Manager for Dashboard Harga Material
 * Reads process.env.STORAGE_PATH with fallback to "./storage".
 */
export const storage = {
  getStorageRoot(): string {
    const envPath = process.env.STORAGE_PATH || "./storage";
    return path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
  },

  getExcelHargaMaterialDir(): string {
    return path.join(this.getStorageRoot(), "excelHargaMaterial");
  },

  getArchiveDir(): string {
    return path.join(this.getExcelHargaMaterialDir(), "archive");
  },

  getTemplateDir(): string {
    return path.join(this.getExcelHargaMaterialDir(), "template");
  },

  ensureDir(dirPath: string): string {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
  },

  saveArchiveFile(fileName: string, buffer: Buffer): string {
    const archiveDir = this.ensureDir(this.getArchiveDir());
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const archiveFilePath = path.join(archiveDir, `${timestamp}_${fileName}`);

    fs.writeFileSync(archiveFilePath, buffer);
    this.rotateArchiveFiles(3);

    return archiveFilePath;
  },

  rotateArchiveFiles(maxFiles: number = 3): void {
    try {
      const archiveDir = this.getArchiveDir();
      if (!fs.existsSync(archiveDir)) return;

      const archiveFiles = fs
        .readdirSync(archiveDir)
        .map((f) => {
          const filePath = path.join(archiveDir, f);
          const stat = fs.statSync(filePath);
          return {
            name: f,
            filePath,
            mtime: stat.mtimeMs,
            isFile: stat.isFile(),
          };
        })
        .filter((item) => item.isFile)
        .sort((a, b) => b.mtime - a.mtime);

      if (archiveFiles.length > maxFiles) {
        const filesToDelete = archiveFiles.slice(maxFiles);
        filesToDelete.forEach((f) => {
          try {
            fs.unlinkSync(f.filePath);
          } catch (err) {
            console.error("Failed to delete old archive file:", f.filePath, err);
          }
        });
      }
    } catch (err) {
      console.error("Error rotating archive files:", err);
    }
  },
};
