package com.canteen.authservice.repository;

import com.canteen.authservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

// No custom queries — email lookup done in service using findAll() + for loop
public interface UserRepository extends JpaRepository<User, Long> {
}