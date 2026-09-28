<?php
declare(strict_types=1);

ob_start();
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function mitr_fail(int $code, string $message): void {
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        mitr_fail(405, 'Method not allowed.');
    }

    $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    $originHost = '';
    foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $header) {
        $value = (string) ($_SERVER[$header] ?? '');
        if ($value === '') {
            continue;
        }
        $parts = parse_url($value);
        if (!is_array($parts) || empty($parts['host'])) {
            mitr_fail(403, 'Request origin was rejected.');
        }
        $originHost = strtolower((string) $parts['host']);
        if (!empty($parts['port'])) {
            $originHost .= ':' . $parts['port'];
        }
        break;
    }
    if ($host !== '' && $originHost !== '' && $originHost !== $host) {
        mitr_fail(403, 'Request origin was rejected.');
    }

    $raw = file_get_contents('php://input');
    if (!is_string($raw) || $raw === '') {
        $raw = json_encode($_POST);
    }
    if (!is_string($raw) || strlen($raw) > 20000) {
        mitr_fail(400, 'Request is too large.');
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        mitr_fail(400, 'Invalid request.');
    }

    if (trim((string) ($data['company'] ?? '')) !== '') {
        echo json_encode(['ok' => true]);
        exit;
    }

    $clean = static function (string $value, int $max, bool $allowNewlines = false): string {
        $value = str_replace("\0", '', $value);
        if ($allowNewlines) {
            $value = str_replace(["\r\n", "\r"], "\n", $value);
        } else {
            $value = str_replace(["\r", "\n"], ' ', $value);
        }
        $value = trim($value);
        if (function_exists('mb_substr')) {
            return mb_substr($value, 0, $max);
        }
        return substr($value, 0, $max);
    };

    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $rateFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'mitr-rate-' . hash('sha256', $ip);
    $now = time();
    $hits = [];
    if (is_file($rateFile)) {
        $decoded = json_decode((string) file_get_contents($rateFile), true);
        if (is_array($decoded)) {
            $hits = $decoded;
        }
    }
    $hits = array_values(array_filter($hits, static function ($ts) use ($now) {
        return is_numeric($ts) && ($now - (int) $ts) < 900;
    }));
    if (count($hits) >= 8) {
        mitr_fail(429, 'Too many requests. Please wait a few minutes and try again.');
    }
    $hits[] = $now;
    @file_put_contents($rateFile, json_encode($hits), LOCK_EX);

    $name = $clean((string) ($data['name'] ?? ''), 120);
    $email = strtolower($clean((string) ($data['email'] ?? ''), 120));
    $type = $clean((string) ($data['type'] ?? ''), 20);

    if ($name === '' || !preg_match('/^[A-Za-z][A-Za-z .\'-]{1,119}$/', $name)) {
        mitr_fail(400, 'Please enter your name.');
    }
    if (!preg_match('/^[A-Za-z0-9._%+-]+@(smail\.)?iitm\.ac\.in$/i', $email)) {
        mitr_fail(400, 'Please use your IIT Madras email address.');
    }

    $venues = [
        'Institute Hospital' => 'cmo@iitm.ac.in',
        'Wellness Centre — 1st Floor, DoSt Office' => 'wellness1@smail.iitm.ac.in',
        'YourDOST — 2nd Floor, Central Library' => 'library.counsellor@iitm.ac.in',
    ];
    $spots = [
        'Himalaya Food Court',
        'CCD / Library Cafe',
        'Hostel Common Room',
        'Department Quadrangle',
        'Any quiet spot on campus',
    ];
    $categories = [
        'General Feedback',
        'Website / Portal Feedback',
        'Event Feedback',
        'Suggestion',
        'Other',
    ];

    $to = [];
    $subject = '';
    $body = '';

    if ($type === 'booking') {
        $date = $clean((string) ($data['date'] ?? ''), 10);
        $time = $clean((string) ($data['time'] ?? ''), 8);
        $venue = $clean((string) ($data['venue'] ?? ''), 80);
        $message = $clean((string) ($data['message'] ?? ''), 2000, true);
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || empty($venues[$venue])) {
            mitr_fail(400, 'Please choose a valid date and venue.');
        }
        $dateTs = strtotime($date . ' 23:59:59');
        if ($dateTs === false || $dateTs < time()) {
            mitr_fail(400, 'Please choose a date in the future.');
        }
        if ($time !== '' && !preg_match('/^\d{2}:\d{2}$/', $time)) {
            mitr_fail(400, 'Please choose a valid time.');
        }
        $to[] = $venues[$venue];
        $subject = 'Counselling session request via MITR website';
        $body = "A counselling session was requested through the MITR wellness portal.\n\n"
            . "Name: {$name}\nEmail: {$email}\nDate: {$date}\n"
            . 'Time: ' . ($time !== '' ? $time : 'No specific time') . "\nVenue: {$venue}\n";
        if ($message !== '') {
            $body .= "\nMessage:\n{$message}\n";
        }
    } elseif ($type === 'coffee') {
        $target = $clean((string) ($data['target'] ?? 'Any Available MITR Coordinator'), 80);
        $location = $clean((string) ($data['location'] ?? ''), 80);
        $note = $clean((string) ($data['note'] ?? ''), 2000, true);
        if (!in_array($location, $spots, true)) {
            mitr_fail(400, 'Please choose a meeting spot.');
        }
        $to[] = 'mitr@smail.iitm.ac.in';
        $subject = 'Book a Coffee with MITR';
        $body = "A coffee chat was requested through the MITR wellness portal.\n\n"
            . "Name: {$name}\nEmail: {$email}\nRequest goes to: {$target}\nPreferred spot: {$location}\n";
        if ($note !== '') {
            $body .= "\nNote:\n{$note}\n";
        }
    } elseif ($type === 'feedback') {
        $category = $clean((string) ($data['category'] ?? ''), 40);
        $message = $clean((string) ($data['message'] ?? ''), 2000, true);
        if (!in_array($category, $categories, true) || $message === '') {
            mitr_fail(400, 'Please enter your feedback.');
        }
        $to[] = 'mitr@smail.iitm.ac.in';
        $subject = 'MITR website feedback — ' . $category;
        $body = "Feedback was submitted through the MITR wellness portal.\n\n"
            . "Name: {$name}\nEmail: {$email}\nCategory: {$category}\n\n{$message}\n";
    } else {
        mitr_fail(400, 'Unknown form type.');
    }

    $body .= "\n—\nSent from the Team MITR wellness portal.";

    $root = dirname(__DIR__);
    $mailerPath = $root . '/admin/src/PHPMailer.php';
    $mailCfg = $root . '/admin/logics/config/mail.php';
    $sent = false;

    if (is_file($mailerPath) && is_file($root . '/admin/src/Exception.php') && is_file($root . '/admin/src/SMTP.php')) {
        require_once $root . '/admin/src/Exception.php';
        require_once $mailerPath;
        require_once $root . '/admin/src/SMTP.php';
        if (is_file($mailCfg)) {
            require_once $mailCfg;
        }

        $sent = false;
        foreach ($to as $address) {
            if (dost_send_mail($address, $address, $subject, $body, [
                'fromName' => 'MITR Wellness Portal',
                'replyTo' => $email,
                'replyToName' => $name,
                'isHTML' => false,
                'timeout' => 20,
            ])) {
                $sent = true;
            }
        }
    } else {
        $headers = [
            'From: MITR Wellness Portal <dostwebdesk@smail.iitm.ac.in>',
            'Reply-To: ' . $email,
            'Content-Type: text/plain; charset=UTF-8',
        ];
        $sent = @mail(implode(',', $to), '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers));
    }

    if (!$sent) {
        mitr_fail(500, 'Your request could not be sent just now. Please try again later.');
    }

    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    echo json_encode(['ok' => true]);
} catch (Throwable $e) {
    error_log('MITR form mail failed: ' . $e->getMessage());
    mitr_fail(500, 'Your request could not be sent just now. Please try again later.');
}
