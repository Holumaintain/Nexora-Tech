# Nexora-Tech Ansible Configuration

This directory contains Ansible automation for preparing Ubuntu EC2 servers
to support the Nexora-Tech DevOps project.

## What it configures

The main playbook (`playbooks/site.yml`) applies these roles:

- **common** — installs administration packages and configures the Africa/Lagos timezone.
- **git** — installs Git.
- **docker** — installs Docker Engine, the Docker CLI, Buildx, and the Compose plugin.
- **aws_cli** — installs AWS CLI v2.
- **kubernetes_tools** — installs kubectl, eksctl, and Helm.

## Requirements

- Ansible installed on the control machine.
- Ubuntu targets with SSH access and sudo privileges.
- The correct SSH private key and target user.
- A security group that permits SSH from the administrator's current public IP.
- Network access to the required package repositories and download sources.

## Configuration

- `ansible.cfg` — Ansible settings.
- `inventory/hosts.ini` — target server inventory.
- `group_vars/all.yml` — shared variables.
- `roles/` — reusable configuration tasks.
- `playbooks/site.yml` — main configuration playbook.

The inventory intentionally leaves EC2 hosts commented out until SSH key
compatibility and security-group access have been verified.

## Validate without connecting to servers

Run these commands from this directory:

```bash
ansible-playbook playbooks/site.yml --syntax-check
ansible-inventory --graph
ansible-playbook playbooks/site.yml --list-tasks
```

These commands validate or display the configuration. They do not install
packages on EC2 servers.

## Apply the configuration

Only after verifying the inventory, SSH key, SSH username, and security-group
rules, activate the intended hosts in `inventory/hosts.ini`.

Then check connectivity:

```bash
ansible webservers -m ansible.builtin.ping
```

Review the proposed changes before applying them:

```bash
ansible-playbook playbooks/site.yml --check --diff
```

If connectivity and the proposed changes are correct, apply the playbook:

```bash
ansible-playbook playbooks/site.yml
```

The playbook uses privilege escalation (`become: true`) and therefore requires
appropriate sudo permissions on each target.

## Important notes

- Keep private keys, AWS access keys, passwords, and other secrets out of Git.
- Verify the target Ubuntu version and CPU architecture before using the roles.
- Match the configured Kubernetes package version to the intended cluster.
- Installing software on EC2 may incur AWS instance and data-transfer costs.
- This automation does not create an EC2 instance or an EKS cluster.
