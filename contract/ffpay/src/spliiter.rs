use std::collections::HashMap;

#[derive(Debug)]
struct PaymentSplitter {
    recipients: HashMap<String, f64>, // User ID -> Split Ratio
}

impl PaymentSplitter {
    fn new() -> Self {
        Self {
            recipients: HashMap::new(),
        }
    }

    fn add_recipient(&mut self, user_id: &str, ratio: f64) {
        self.recipients.insert(user_id.to_string(), ratio);
    }

    fn split_payment(&self, total_amount: f64) -> HashMap<String, f64> {
        let total_ratio: f64 = self.recipients.values().sum();
        let mut payments = HashMap::new();

        for (user, &ratio) in &self.recipients {
            let amount = (ratio / total_ratio) * total_amount;
            payments.insert(user.clone(), amount);
        }

        payments
    }
}

fn main() {
    let mut splitter = PaymentSplitter::new();
    splitter.add_recipient("user1", 0.5);
    splitter.add_recipient("user2", 0.3);
    splitter.add_recipient("user3", 0.2);

    let total_payment = 100.0;
    let split_result = splitter.split_payment(total_payment);

    for (user, amount) in split_result {
        println!("{} receives ${:.2}", user, amount);
    }
}
