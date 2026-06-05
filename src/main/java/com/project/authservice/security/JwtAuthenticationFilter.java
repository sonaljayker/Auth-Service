package com.project.authservice.security;

import com.project.authservice.helper.UserHelper;
import com.project.authservice.repository.UserRepository;
import io.jsonwebtoken.*;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Configuration
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;
    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer "))
        {
            String token = header.substring(7);

            if (!jwtService.isAccessToken(token))
            {
                filterChain.doFilter(request, response);
                return;
            }

            // token extract and validate then authentication create and security context

            try{
                Jws<Claims> parse=jwtService.parse(token);
                Claims payload=parse.getBody();
                String userId= payload.getSubject();
                UUID userUuid= UserHelper.parseUUID(userId);

                userRepository.findById(userUuid).ifPresent(user -> {
                    if (user.isEnabled())
                    {
                        List<GrantedAuthority> authorities= user.getRoles()==null ? List.of(): user.getRoles()
                                .stream().map(role -> new SimpleGrantedAuthority(role.getName())).collect(Collectors.toList());
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), null, authorities);
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        //final line: set authentication to security context
                        if (SecurityContextHolder.getContext().getAuthentication() == null)
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                });

            } catch (ExpiredJwtException e) {
                e.printStackTrace();
            } catch (MalformedJwtException e) {
                e.printStackTrace();
            } catch (JwtException e) {
                e.printStackTrace();
            }catch (Exception e){
                e.printStackTrace();
            }

        filterChain.doFilter(request, response);
    }
    }
}
