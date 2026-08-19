import * as fs from "fs";
import * as path from "path";

/**
 * Centralized Storage Manager
 * Reads process.env.STORAGE_PATH with fallback to "./storage".
 * Supports both development and production (e.g. VPS /var/www/storage/dashboard).
 */
export const storage = {
  /**
   * Get the absolute root storage directory path.
   */
  getStorageRoot(): string {
    const envPath = process.env.STORAGE_PATH || "./storage";
    return path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
  },

  /**
   * Get excelWIP base directory path.
   */
  getExcelWipDir(): string {
    return path.join(this.getStorageRoot(), "excelWIP");
  },

  /**
   * Get archive directory path for a specific category.
   */
  getCategoryArchiveDir(category: string): string {
    const safeCategory = category.toLowerCase().replace(/[^a-z0-9]/gi, "_");
    return path.join(this.getExcelWipDir(), safeCategory);
  },

  /**
   * Get template directory path.
   */
  getTemplateDir(): string {
    return path.join(this.getExcelWipDir(), "template");
  },

  /**
   * Ensure directory exists (creates recursively if missing).
   */
  ensureDir(dirPath: string): string {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
  },

  /**
   * Save an uploaded archive file for a category and rotate history (keep max 3).
   */
  saveArchiveFile(category: string, fileName: string, buffer: Buffer): string {
    const archiveDir = this.ensureDir(this.getCategoryArchiveDir(category));
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const archiveFilePath = path.join(archiveDir, `${timestamp}_${fileName}`);

    fs.writeFileSync(archiveFilePath, buffer);

    // Rotate: keep max 3 newest files
    this.rotateArchiveFiles(category, 3);

    return archiveFilePath;
  },

  /**
   * Keep maximum N newest archive files for a category, deleting older files.
   */
  rotateArchiveFiles(category: string, maxFiles: number = 3): void {
    try {
      const archiveDir = this.getCategoryArchiveDir(category);
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
        .sort((a, b) => b.mtime - a.mtime); // Newest first

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

  /**
   * Read template file buffer by filename.
   */
  readTemplateFile(fileName: string): Buffer | null {
    const templatePath = path.join(this.getTemplateDir(), fileName);
    if (!fs.existsSync(templatePath)) {
      return null;
    }
    return fs.readFileSync(templatePath);
  },

  /**
   * Check if a template file exists.
   */
  hasTemplateFile(fileName: string): boolean {
    const templatePath = path.join(this.getTemplateDir(), fileName);
    return fs.existsSync(templatePath);
  },
};
