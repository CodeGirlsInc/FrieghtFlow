#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
}

#[derive(Debug, Clone)]
pub struct ServerConfig {
    pub host: Option<String>,
    pub port: Option<u16>,
    pub max_connections: Option<usize>,
    pub timeout_seconds: Option<u64>,
    pub enable_logging: Option<bool>,
    pub log_level: Option<LogLevel>,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            host: None,
            port: None,
            max_connections: None,
            timeout_seconds: None,
            enable_logging: None,
            log_level: None,
        }
    }
}

pub struct ServerConfigBuilder {
    host: Option<String>,
    port: Option<u16>,
    max_connections: Option<usize>,
    timeout_seconds: Option<u64>,
    enable_logging: Option<bool>,
    log_level: Option<LogLevel>,
}

impl ServerConfigBuilder {
    pub fn host(mut self, host: &str) -> Self {
        self.host = Some(host.to_string());
        self
    }

    pub fn port(mut self, port: u16) -> Self {
        self.port = Some(port);
        self
    }

    pub fn max_connections(mut self, max: usize) -> Self {
        self.max_connections = Some(max);
        self
    }

    pub fn timeout_seconds(mut self, timeout: u64) -> Self {
        self.timeout_seconds = Some(timeout);
        self
    }

    pub fn enable_logging(mut self, enable: bool) -> Self {
        self.enable_logging = Some(enable);
        self
    }

    pub fn log_level(mut self, level: LogLevel) -> Self {
        self.log_level = Some(level);
        self
    }

    pub fn build(self) -> ServerConfig {
        ServerConfig {
            host: self.host,
            port: self.port,
            max_connections: self.max_connections,
            timeout_seconds: self.timeout_seconds,
            enable_logging: self.enable_logging,
            log_level: self.log_level,
        }
    }
}

impl ServerConfig {
    pub fn builder() -> ServerConfigBuilder {
        ServerConfigBuilder {
            host: None,
            port: None,
            max_connections: None,
            timeout_seconds: None,
            enable_logging: None,
            log_level: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_builder_basic() {
        let config = ServerConfig::builder()
            .host("127.0.0.1")
            .port(8080)
            .build();

        assert_eq!(config.host, Some("127.0.0.1".to_string()));
        assert_eq!(config.port, Some(8080));
    }

    #[test]
    fn test_builder_all_fields() {
        let config = ServerConfig::builder()
            .host("0.0.0.0")
            .port(3000)
            .max_connections(500)
            .timeout_seconds(60)
            .enable_logging(true)
            .log_level(LogLevel::Debug)
            .build();

        assert_eq!(config.host, Some("0.0.0.0".to_string()));
        assert_eq!(config.port, Some(3000));
        assert_eq!(config.max_connections, Some(500));
        assert_eq!(config.timeout_seconds, Some(60));
        assert_eq!(config.enable_logging, Some(true));
        assert_eq!(config.log_level, Some(LogLevel::Debug));
    }

    #[test]
    fn test_builder_empty() {
        let config = ServerConfig::builder().build();
        assert_eq!(config, ServerConfig::default());
    }

    #[test]
    fn test_builder_partial() {
        let config = ServerConfig::builder()
            .host("localhost")
            .timeout_seconds(30)
            .build();

        assert_eq!(config.host, Some("localhost".to_string()));
        assert_eq!(config.timeout_seconds, Some(30));
        assert_eq!(config.port, None);
    }
}
