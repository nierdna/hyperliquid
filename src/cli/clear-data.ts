import fs from "fs";
import path from "path";
import chalk from "chalk";

const DATA_DIR = path.join(__dirname, "../../data");

/**
 * Clear data files but keep directory structure
 * @param targetDirs Optional array of subdirectories to clear (relative to data dir)
 * @param dryRun If true, only show what would be deleted without actually deleting
 */
async function clearData(targetDirs?: string[], dryRun: boolean = false) {
  console.log(
    chalk.yellow(
      `Starting data cleanup process${dryRun ? " (DRY RUN)" : ""}...`
    )
  );

  try {
    // Check if data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      console.log(chalk.red("Data directory does not exist!"));
      return;
    }

    // If specific directories are provided, validate they exist
    if (targetDirs && targetDirs.length > 0) {
      const invalidDirs = targetDirs.filter(
        (dir) => !fs.existsSync(path.join(DATA_DIR, dir))
      );
      if (invalidDirs.length > 0) {
        console.log(
          chalk.red(
            `The following directories do not exist: ${invalidDirs.join(", ")}`
          )
        );
        return;
      }
    }

    // Function to recursively process directories
    const processDirectory = (dirPath: string) => {
      const items = fs.readdirSync(dirPath);
      let filesDeleted = 0;
      let bytesFreed = 0;

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          // Recursively process subdirectories
          const subDirResults = processDirectory(itemPath);
          filesDeleted += subDirResults.filesDeleted;
          bytesFreed += subDirResults.bytesFreed;
        } else {
          // Delete files
          if (!dryRun) {
            fs.unlinkSync(itemPath);
          }
          console.log(
            chalk.green(
              `${dryRun ? "Would delete" : "Deleted"} file: ${path.relative(
                DATA_DIR,
                itemPath
              )} (${formatBytes(stats.size)})`
            )
          );
          filesDeleted++;
          bytesFreed += stats.size;
        }
      }

      return { filesDeleted, bytesFreed };
    };

    // Format bytes to human-readable format
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    let totalFilesDeleted = 0;
    let totalBytesFreed = 0;

    // Process either specific directories or the entire data directory
    if (targetDirs && targetDirs.length > 0) {
      console.log(
        chalk.blue(
          `Clearing only specified directories: ${targetDirs.join(", ")}`
        )
      );

      for (const dir of targetDirs) {
        const dirPath = path.join(DATA_DIR, dir);
        if (fs.existsSync(dirPath)) {
          const results = processDirectory(dirPath);
          totalFilesDeleted += results.filesDeleted;
          totalBytesFreed += results.bytesFreed;
        }
      }
    } else {
      console.log(chalk.blue("Clearing all data directories"));
      const results = processDirectory(DATA_DIR);
      totalFilesDeleted = results.filesDeleted;
      totalBytesFreed = results.bytesFreed;
    }

    console.log(
      chalk.green(
        `Data cleanup ${dryRun ? "would have" : ""} completed successfully!`
      )
    );
    console.log(
      chalk.yellow(
        `${
          dryRun ? "Would have deleted" : "Deleted"
        } ${totalFilesDeleted} files (${formatBytes(totalBytesFreed)})`
      )
    );
    console.log(chalk.yellow("Note: Directory structure is preserved."));
  } catch (error) {
    console.error(chalk.red("Error during data cleanup:"), error);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRunIndex = args.indexOf("--dry-run");
const dryRun = dryRunIndex !== -1;

// Remove the --dry-run flag from args if present
if (dryRunIndex !== -1) {
  args.splice(dryRunIndex, 1);
}

// Any remaining args are treated as target directories
const targetDirs = args.length > 0 ? args : undefined;

// Execute the function
clearData(targetDirs, dryRun);
