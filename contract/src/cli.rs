use std::str::FromStr;

const MIN_TIMEOUT: u64 = 1;
const MAX_TIMEOUT: u64 = 3600;

#[derive(Debug)]
pub struct TimeoutError(String);

impl std::fmt::Display for TimeoutError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl std::error::Error for TimeoutError {}

pub fn parse_timeout(input: &str) -> Result<u64, TimeoutError> {
    let value: u64 = input.parse()
        .map_err(|_| TimeoutError(
            format!("'{}' is not a valid number", input)
        ))?;

    if value < MIN_TIMEOUT || value > MAX_TIMEOUT {
        return Err(TimeoutError(
            format!("timeout must be between {} and {} seconds, got {}", 
                    MIN_TIMEOUT, MAX_TIMEOUT, value)
        ));
    }

    Ok(value)
}

pub fn get_timeout_or_default(input: Option<&str>) -> Result<u64, TimeoutError> {
    match input {
        Some(val) => parse_timeout(val),
        None => Ok(30), // Default value
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_timeout() {
        assert_eq!(parse_timeout("30").unwrap(), 30);
        assert_eq!(parse_timeout("1").unwrap(), 1);
        assert_eq!(parse_timeout("3600").unwrap(), 3600);
    }

    #[test]
    fn test_timeout_too_small() {
        assert!(parse_timeout("0").is_err());
        let err = parse_timeout("0").unwrap_err();
        assert!(err.to_string().contains("between"));
    }

    #[test]
    fn test_timeout_too_large() {
        assert!(parse_timeout("3601").is_err());
        let err = parse_timeout("3601").unwrap_err();
        assert!(err.to_string().contains("between"));
    }

    #[test]
    fn test_negative_timeout() {
        assert!(parse_timeout("-10").is_err());
    }

    #[test]
    fn test_non_numeric() {
        assert!(parse_timeout("abc").is_err());
        let err = parse_timeout("abc").unwrap_err();
        assert!(err.to_string().contains("not a valid number"));
    }

    #[test]
    fn test_default_timeout() {
        assert_eq!(get_timeout_or_default(None).unwrap(), 30);
        assert_eq!(get_timeout_or_default(Some("60")).unwrap(), 60);
    }
}
