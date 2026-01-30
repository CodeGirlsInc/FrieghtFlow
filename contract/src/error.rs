use std::path::PathBuf;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ConfigError {
    #[error("Failed to read configuration file at '{path}': {source}")]
    ReadConfig {
        path: PathBuf,
        #[from]
        source: std::io::Error,
    },

    #[error("Failed to parse configuration file at '{path}': {reason}")]
    ParseConfig { path: PathBuf, reason: String },

    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),
}
